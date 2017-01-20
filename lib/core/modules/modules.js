/* @flow */

import _ from 'lodash';
import { flow, keyBy, map } from 'lodash/fp';
import { Storage, i18n } from '../../environment';
import {
	downcast,
	matchesPageLocation,
} from '../../utils';
import { Module } from '../module';
import type { OpaqueModuleId } from '../module';

const moduleContext = require.context('../../modules', false, /\.js$/);

const enabled = {};

const _modules = _.once(flow(
	() => moduleContext.keys(),
	map(moduleContext),
	map(e => e.module),
	map(mod => downcast(mod, Module)), // ensure that all modules are instances of `Module`
	keyBy(mod => mod.moduleID)
));

if (process.env.NODE_ENV === 'development') {
	// for debugging only! do not use `modules` in any committed code
	window.modules = _modules;
}

export async function _loadModulePrefs() {
	const storedPrefs = await Storage.get('RES.modulePrefs') || {};
	const modules = _modules();

	for (const id in modules) {
		if (modules[id].alwaysEnabled) {
			enabled[id] = true;
		} else if (id in storedPrefs) {
			enabled[id] = storedPrefs[id];
		} else {
			enabled[id] = !modules[id].disabledByDefault;
		}
	}
}

export function setEnabled(opaqueId: OpaqueModuleId, enable: boolean) {
	const module = get(opaqueId);
	enable = !!enable;
	// set enabled state of module
	enabled[module.moduleID] = enable;
	Storage.patch('RES.modulePrefs', { [module.moduleID]: enable });
	module.onToggle(enable);
}

export function all(): Array<Module<any>> {
	return Object.values(_modules());
}

export function isEnabled(opaqueId: OpaqueModuleId): boolean {
	return !!enabled[get(opaqueId).moduleID];
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
	if (!(id in _modules())) {
		throw new Error(`Module "${id}" not found.`);
	}

	return getUnchecked(id);
}

export function getUnchecked(id: string): Module<any> {
	return _modules()[id];
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
