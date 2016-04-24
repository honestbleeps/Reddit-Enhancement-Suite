import _ from 'lodash';
import * as Modules from '../modules';
import { map } from '../../utils';

export async function _loadModuleOptions() {
	await Promise.all(Modules.all()::map(mod => load(mod)));
}

// only copy defaults once per module
const _loadDefaults = _.memoize(module => {
	// copy over default values
	for (const opt of Object.values(module.options)) {
		opt.default = opt.value;
	}
}, module => module.moduleID);

const _load = _.memoize(async (module, obsolete) => {
	if (_.isEmpty(module.options)) {
		// module has no options, don't attempt to load them
		return module.options;
	}

	_loadDefaults(module);

	const storedOptions = await Storage.get(`RESoptions.${module.moduleID}`) || {};

	// strip out obsolete options
	for (const key in module.options) {
		if (module.options[key] && module.options[key].obsolete) {
			delete module.options[key];
		}
	}

	// merge options (in case new ones were added via code)
	for (const key in storedOptions) {
		// skip null options (should never happen)
		if (!storedOptions[key]) continue;

		if (module.options[key]) {
			// copy the values of normal options
			module.options[key].value = storedOptions[key].value;
		} else if (obsolete) {
			// copy in obsolete options
			module.options[key] = storedOptions[key];
			module.options[key].obsolete = true;
		}
	}

	return module.options;
}, (module, obsolete) => `${module.moduleID}${obsolete ? '__obsolete__' : ''}`);

export function load(opaqueId, { obsolete = false } = {}) {
	const module = Modules.get(opaqueId);
	return _load(module, obsolete);
}

export function set(opaqueId, optionKey, optionValue) {
	if (/_[\d]+$/.test(optionKey)) {
		optionKey = optionKey.replace(/_[\d]+$/, '');
	}

	const module = Modules.get(opaqueId);

	if (!module.options[optionKey]) {
		console.warn('Could not find option', module.moduleID, optionKey);
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
	module.options[optionKey].value = value;
	Storage.patch(`RESoptions.${module.moduleID}`, { [optionKey]: { value } });

	return true;
}
