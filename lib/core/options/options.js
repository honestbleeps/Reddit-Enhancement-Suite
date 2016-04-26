import _ from 'lodash';
import * as Modules from '../modules';
import { Storage } from '../../environment';
import { collect, map } from '../../utils';

function getKey(module) {
	return `RESoptions.${module.moduleID}`;
}

export async function _loadModuleOptions() {
	const allOptions = await Storage.batch(Modules.all()::map(mod => getKey(mod))::collect());

	for (const mod of Modules.all()) {
		_initOptions(mod, allOptions[getKey(mod)]);
	}
}

// copy in stored options and assign default values
const _initOptions = _.memoize((module, storedOptions) => {
	if (_.isEmpty(module.options)) {
		// module has no options, don't attempt to load them
		return;
	}

	// copy over default values
	for (const opt of Object.values(module.options)) {
		opt.default = opt.value;
	}

	if (!storedOptions) {
		// no stored options, there's nothing to copy over
		return;
	}

	for (const key in storedOptions) {
		// skip null options (should never happen)
		if (!storedOptions[key]) continue;

		// skip obsolete options
		if (!module.options[key]) continue;

		// normal option, copy in the value from storage
		module.options[key].value = storedOptions[key].value;
	}
}, module => module.moduleID);

const _loadObsolete = _.memoize(async module => {
	const storedOptions = await Storage.get(getKey(module));

	_initOptions(module, storedOptions);

	// shallow clone the module's options, and include any obsolete options, which means:
	// a. the obsolete options will not be added to the actual module's options
	// b. changes to non-obsolete option values will affect the actual module's options
	return {
		...storedOptions,
		...module.options
	};
}, module => module.moduleID);

export function loadObsolete(opaqueId) {
	const module = Modules.get(opaqueId);
	return _loadObsolete(module);
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
