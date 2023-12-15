/* @flow */

import { i18n } from '../../environment';
import {
	downcast,
	matchesPageLocation,
	markStart,
	markEnd,
} from '../../utils';
import { Module, getModuleId } from '../module';
import * as __modules from '../../modules'; // eslint-disable-line import/no-restricted-paths

import type { OpaqueModuleId } from '../module';
import { storage } from './storage';

const enabled = new Map();

const modules = new Map(
	Object.values(__modules).map(module => [module.moduleID, downcast(module, Module)]), // ensure that all modules are instances of `Module`
);

if (process.env.NODE_ENV === 'development') {
	// for debugging only! do not use `modules` in any committed code
	window.modules = modules;
}

// When containing modules, no other modules other than those specified should run
// Stages `beforeLoad`, `go`, `afterLoad` may only be executed on these modules
export const allowedModules: Array<string> = [];

export async function _loadModulePrefs() {
	const storedPrefs = await storage.getAll();

	for (const [id, module] of modules) {
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
			}),
	);
}

export function all(): Array<Module<any>> {
	return Array.from(modules.values());
}

export function isEnabled(opaqueId: OpaqueModuleId): boolean {
	return !!enabled.get(get(opaqueId).moduleID);
}

export function isRunning(opaqueId: OpaqueModuleId): boolean {
	const module = get(opaqueId);
	return (
		(!allowedModules.length || allowedModules.includes(module.moduleID)) &&
		isEnabled(module) &&
		matchesPageLocation(module.include, module.exclude) &&
		module.shouldRun()
	);
}

export function get(opaqueId: OpaqueModuleId): Module<any> {
	return _get(getModuleId(opaqueId));
}

function _get(id) {
	const mod = getUnchecked(id);
	if (!mod) throw new Error(`Module "${id}" not found.`);
	return mod;
}

export function getUnchecked(id: string): void | Module<any> {
	return modules.get(id);
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
