/* @flow */

import { flow, keyBy, map } from 'lodash/fp';
import { Storage, i18n } from '../../environment';
import {
	downcast,
	matchesPageLocation,
	markStart,
	markEnd,
} from '../../utils';
import { Module } from '../module';
import type { OpaqueModuleId } from '../module';

import __modules from 'sibling-loader?import=module!../../modules/about'; // eslint-disable-line

const modulePrefsStorage = Storage.wrapBlob('RES.modulePrefs',
	(): boolean => { throw new Error('Default module enabled state should never be accessed'); });

const enabled = new Map();

const modules = flow(
	() => Object.values(__modules),
	map(mod => downcast(mod, Module)), // ensure that all modules are instances of `Module`
	keyBy(mod => mod.moduleID)
)();

if (process.env.NODE_ENV === 'development') {
	// for debugging only! do not use `modules` in any committed code
	window.modules = modules;
}

export async function _loadModulePrefs() {
	// TODO greasemonkey: why was this change necessary? Our storage shim is wrong
	const storedPrefs = (await modulePrefsStorage.getAll()) || {};

	for (const [id, module] of Object.entries(modules)) {
		if (module.alwaysEnabled) {
			enabled.set(id, true);
		} else if (storedPrefs.hasOwnProperty(id)) {
			enabled.set(id, storedPrefs[id]);
		} else {
			enabled.set(id, !module.disabledByDefault);
		}
	}
}

const ERRORED_KEY = Symbol('errored');
export async function _runModuleStage(stage: $Keys<Module<any>>, { skipEnabledCheck = false }: {| skipEnabledCheck?: boolean |} = {}) {
	await Promise.all(
		all()
			.filter(module => (
				module[stage] &&
				!module[ERRORED_KEY] &&
				(skipEnabledCheck || isRunning(module))
			))
			.map(async module => {
				const tag = markStart();
				try {
					const fn = module[stage];
					await fn();
				} catch (e) {
					module[ERRORED_KEY] = true;
					console.error('Error in module:', module.moduleID, 'during:', stage);
					console.error(e);
				}
				markEnd(tag, `${module.moduleID} (${stage})`);
			})
	);
}

export function setEnabled(opaqueId: OpaqueModuleId, enable: boolean) {
	const module = get(opaqueId);
	// set enabled state of module
	enabled.set(module.moduleID, enable);
	modulePrefsStorage.set(module.moduleID, enable);
	module.onToggle(enable);
}

export function all(): Array<Module<any>> {
	return Object.values(modules);
}

export function isEnabled(opaqueId: OpaqueModuleId): boolean {
	return !!enabled.get(get(opaqueId).moduleID);
}

export function isRunning(opaqueId: OpaqueModuleId): boolean {
	const module = get(opaqueId);
	return (
		isEnabled(module) &&
		matchesPageLocation(module.include, module.exclude) &&
		module.shouldRun()
	);
}

export function get(opaqueId: OpaqueModuleId): Module<any> {
	if (!opaqueId) {
		throw new TypeError(`Expected module, moduleID, or namespace; found: ${opaqueId}`);
	}

	if (typeof opaqueId === 'string') {
		// raw moduleID
		return _get(opaqueId);
	} else if (opaqueId.module) {
		// namespace
		return _get(opaqueId.module.moduleID);
	} else {
		// assume module-like object
		return _get(opaqueId.moduleID);
	}
}

function _get(id) {
	const mod = getUnchecked(id);
	if (!mod) throw new Error(`Module "${id}" not found.`);
	return mod;
}

export function getUnchecked(id: string): void | Module<any> {
	return modules[id];
}

export function getByCategory(category: string): Array<Module<any>> {
	return all()
		.filter(module => !module.hidden)
		.filter(module => module.category === category)
		.sort((a, b) => {
			const sortComparison = (a.sort || 0) - (b.sort || 0);
			if (sortComparison !== 0) {
				return sortComparison;
			}

			return (i18n(a.moduleName).toLowerCase() > i18n(b.moduleName).toLowerCase()) ? 1 : -1;
		});
}
