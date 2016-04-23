import { Storage } from '../../environment';
import {
	collect,
	filter,
	matchesPageLocation,
	objectValidator
} from '../../utils';
import { flow, forEach, keyBy, map, tap } from 'lodash/fp';

const moduleContext = require.context('../../modules', false, /\.js$/);

const enabled = {};

const modules = flow(
	map(moduleContext),
	map('module'),
	tap(forEach(objectValidator({ requiredProps: ['moduleID', 'moduleName', 'category', 'description'] }))),
	keyBy('moduleID')
)(moduleContext.keys());

export async function _loadModulePrefs() {
	const storedPrefs = await Storage.get('RES.modulePrefs') || {};

	for (const id in modules) {
		if (id in storedPrefs) {
			enabled[id] = storedPrefs[id];
		} else {
			enabled[id] = !modules[id].disabledByDefault;
		}
	}
}

export function setEnabled(opaqueId, enable) {
	const module = get(opaqueId);
	if (module.alwaysEnabled) {
		return;
	}
	enable = !!enable;
	// set enabled state of module
	enabled[module.moduleID] = enable;
	Storage.patch('RES.modulePrefs', { [module.moduleID]: enable });
	if (module.onToggle) module.onToggle(enable);
}

export function* all() {
	for (const id in modules) {
		yield modules[id];
	}
}

export function isEnabled(opaqueId) {
	return !!enabled[get(opaqueId).moduleID];
}

export function isRunning(opaqueId) {
	const module = get(opaqueId);
	return (
		isEnabled(module) &&
		matchesPageLocation(module.include, module.exclude) &&
		(!module.shouldRun || module.shouldRun())
	);
}

export function get(opaqueId) {
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
	if (!(id in modules)) {
		throw new Error(`Module "${id}" not found.`);
	}

	return getUnchecked(id);
}

export function getUnchecked(id) {
	return modules[id];
}

export function getByCategory(category) {
	return all()
		::filter(module => !module.hidden)
		::filter(module => [].concat(module.category).indexOf(category) !== -1)
		::collect()
		.sort((a, b) => {
			if (a.sort !== undefined || b.sort !== undefined) {
				const sortComparison = (a.sort || 0) - (b.sort || 0);
				if (sortComparison !== 0) {
					return sortComparison;
				}
			}

			if (a.moduleName.toLowerCase() > b.moduleName.toLowerCase()) return 1;
			return -1;
		});
}
