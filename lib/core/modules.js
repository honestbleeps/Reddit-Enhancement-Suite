import { Storage } from 'environment';
import {
	collect,
	filter,
	matchesPageLocation,
	objectValidator
} from '../utils';
import { flow, forEach, keyBy, map, tap } from 'lodash/fp';

const moduleContext = require.context('../modules', false, /\.js$/);

const enabled = {};

const modules = flow(
	map(moduleContext),
	map(({ module }) => module),
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

export function enableModule(id, enable) {
	const module = getModuleWithId(id);
	if (module.alwaysEnabled) {
		return;
	}
	enable = !!enable;
	// set enabled state of module
	enabled[id] = enable;
	Storage.patch('RES.modulePrefs', { [id]: enable });
	if (module.onToggle) module.onToggle(enable);
}

export { allModules as modules };
function* allModules() {
	for (const id in modules) {
		yield modules[id];
	}
}

export function isEnabled({ moduleID: id }) { // prefer passing the module itself
	if (process.env.NODE_ENV === 'development') {
		if (!(id in modules)) {
			throw new Error(`Module "${id}" not found.`);
		}
		if (!(id in enabled)) {
			throw new Error(`Enabled state of module "${id}" was not loaded.`);
		}
	}
	return !!enabled[id];
}

export function isRunning(module) {
	return (
		isEnabled(module) &&
		matchesPageLocation(module.include, module.exclude) &&
		(!module.shouldRun || module.shouldRun())
	);
}

export function getModuleWithId(id) {
	if (process.env.NODE_ENV === 'development') {
		if (!(id in modules)) {
			throw new Error(`Module "${id}" not found.`);
		}
	}
	return modules[id];
}

export function getModuleIDsByCategory(category) {
	return allModules()
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
		})
		.map(module => module.moduleID);
}
