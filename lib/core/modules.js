import _ from 'lodash';
import {
	bodyClasses,
	collect,
	filter,
	matchesPageLocation,
	objectValidator
} from '../utils';
import { flow, forEach, keyBy, map, tap } from 'lodash/fp';
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
	await Promise.all(Object.keys(modules).map(id => loadOptions(id)));
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

export function setOption(id, optionKey, optionValue) {
	if (/_[\d]+$/.test(optionKey)) {
		optionKey = optionKey.replace(/_[\d]+$/, '');
	}

	const options = getModuleWithId(id).options;

	if (!options[optionKey]) {
		console.warn('Could not find option', id, optionKey);
		return false;
	}

	let value;
	if (optionValue === '') {
		value = '';
	} else if (isNaN(optionValue) || typeof optionValue === 'boolean' || typeof optionValue === 'object') {
		value = optionValue;
	} else if (optionValue.indexOf && optionValue.indexOf('.') !== -1) {
		value = parseFloat(optionValue);
	} else {
		value = parseInt(optionValue, 10);
	}

	// save value to module options and storage
	options[optionKey].value = value;
	storage.patch(`RESoptions.${id}`, { [optionKey]: { value } });

	return true;
}

export const loadOptions = _.memoize(async (id, { obsolete = false } = {}) => {
	const options = getModuleWithId(id).options;

	// copy over default values
	for (const opt of Object.values(options)) {
		opt.default = opt.value;
	}

	const storedOptions = await storage.get(`RESoptions.${id}`) || {};

	// merge options (in case new ones were added via code)
	for (const key in storedOptions) {
		// skip null options (should never happen)
		if (!storedOptions[key]) continue;

		if (options[key]) {
			// copy the values of normal options
			options[key].value = storedOptions[key].value;
		} else if (obsolete) {
			// copy in obsolete options
			options[key] = storedOptions[key];
			options[key].obsolete = true;
		}
	}

	return options;
}, (id, { obsolete = false } = {}) => `${id}${obsolete ? '__obsolete__' : ''}`);
