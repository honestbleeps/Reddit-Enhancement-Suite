import _ from 'lodash';
import { getModuleWithId, modules } from '../';
import { map } from '../../utils';

export async function _loadModuleOptions() {
	await Promise.all(modules()::map(({ moduleID: id }) => load(id)));
}

export const load = _.memoize(async (id, { obsolete = false } = {}) => {
	const options = getModuleWithId(id).options;

	// copy over default values
	for (const opt of Object.values(options)) {
		opt.default = opt.value;
	}

	const storedOptions = await Storage.get(`RESoptions.${id}`) || {};

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

export function set(id, optionKey, optionValue) {
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
	Storage.patch(`RESoptions.${id}`, { [optionKey]: { value } });

	return true;
}
