import {
	bodyClasses,
	matchesPageLocation,
	objectValidator
} from '../utils';
import { flow, forEach, keyBy, map, tap } from 'lodash/fp';
import { getOptions } from './';
import { storage } from 'environment';

const moduleContext = require.context('../modules', false, /\.js$/);

const enabled = {};

const modules = flow(
	map(moduleContext),
	tap(forEach(objectValidator({ requiredProps: ['moduleID'] }))),
	map(mod => ({
		moduleName: mod.moduleID,
		category: 'General',
		description: '',
		options: {},
		shouldRun() {
			return enabled[this.moduleID] && matchesPageLocation(this.include, this.exclude);
		},
		include: ['all'],
		exclude: [],
		onToggle(state) {}, // eslint-disable-line no-unused-vars
		loadDynamicOptions() {},
		beforeLoad() {},
		go() {},
		afterLoad() {},
		always() {},

		...mod,

		// may not be overridden
		addOptionsBodyClasses() {
			// Adds body classes for enabled options that have `bodyClass: true`
			// In the form `res-moduleId-optionKey` for boolean options
			// and `res-moduleId-optionKey-optionValue` for enum options
			// spaces in enum option values will be replaced with underscores
			if (!this.shouldRun()) return;

			for (const [optId, opt] of Object.entries(this.options)) {
				if (!(opt.bodyClass && opt.value)) return;

				if (opt.type !== 'enum' && opt.type !== 'boolean') {
					throw new Error(`modules['${this.moduleID}'].options['${optId}'] - only enum and boolean options may generate body classes`);
				}

				let cls = typeof opt.bodyClass === 'string' ? opt.bodyClass : `res-${this.moduleID}-${optId}`;

				if (opt.type === 'enum') {
					cls += `-${opt.value.replace(/\s/g, '_')}`;
				}

				bodyClasses.add(cls);
			}
		}
	})),
	keyBy('moduleID')
)(moduleContext.keys());


export async function _loadModuleOptions() {
	await Promise.all(Object.keys(modules).map(id => getOptions(id)));
}

export async function _loadModulePrefs() {
	const storedPrefs = await storage.get('RES.modulePrefs') || {};

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
	storage.patch('RES.modulePrefs', { [id]: enable });
	module.onToggle(enable);
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

export function getModuleWithId(id) {
	if (process.env.NODE_ENV === 'development') {
		if (!(id in modules)) {
			throw new Error(`Module "${id}" not found.`);
		}
	}
	return modules[id];
}
