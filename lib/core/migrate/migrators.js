/* @flow */

import _ from 'lodash';
import { Storage } from '../../environment';
import * as Options from '../options';

export async function updateOption(moduleID: string, optionName: string, formerDefaultValue: mixed, valueOrFunction?: mixed) {
	try {
		const options = await Options.loadRaw(moduleID);
		const option = options && options[optionName];

		// If no value for this option is stored, it will always use the current default value
		// and so it doesn't need to be updated.
		if (!option) return;

		// Only update this option to the new default value if its current value
		// hasn't been changed from the former default value.
		if (!optionMatchesFormerDefaultValue(option, formerDefaultValue)) return;

		const newValue = updateValue(option.value, valueOrFunction);

		if (typeof newValue !== 'undefined') {
			await Options.set(moduleID, optionName, newValue);
		}
	} catch (e) {
		console.error(`Couldn't migrate ${moduleID}::${optionName} from`, formerDefaultValue, 'to/via', valueOrFunction, e);
	}
}

export async function forceUpdateOption(moduleID: string, optionName: string, valueOrFunction?: mixed) {
	// ☢ ☠ ☣  DANGER, WILL ROBINSON, DANGER ☠ ☣ ☢
	// Make sure valueOrFunction doesn't destroy user settings!
	try {
		const options = await Options.loadRaw(moduleID);
		const option = options && options[optionName];

		// If no value for this option is stored, it will always use the current default value
		// and so it doesn't need to be updated.
		if (!option) return;

		const newValue = updateValue(option.value, valueOrFunction);

		if (typeof newValue !== 'undefined') {
			await Options.set(moduleID, optionName, newValue);
		}
	} catch (e) {
		console.error(`Couldn't migrate ${moduleID}::${optionName} to`, valueOrFunction, e);
	}
}

export async function moveOption(oldModuleID: string, oldOptionName: string, newModuleID: string, newOptionName: string, valueOrFunction?: mixed) {
	try {
		const options = await Options.loadRaw(oldModuleID);
		const option = options && options[oldOptionName];

		// If no value for this option is stored, it had been using the old default value
		// and so we do not need to change the new option, since it will also be using the default value.
		if (!option) return;

		const newValue = updateValue(option.value, valueOrFunction);

		if (typeof newValue !== 'undefined') {
			await Options.set(newModuleID, newOptionName, newValue);
		}
	} catch (e) {
		console.error(`Couldn't migrate ${oldModuleID}::${oldOptionName} to ${newModuleID}::${newOptionName} via`, valueOrFunction, e);
	}
}

export async function moveStorageToOption(oldKey: string, newModuleID: string, newOptionName: string, valueOrFunction?: mixed) {
	const oldValue = await Storage.get(oldKey);

	if (oldValue === null) {
		return;
	}

	const newValue = updateValue(oldValue, valueOrFunction);

	try {
		if (typeof newValue !== 'undefined') {
			await Options.set(newModuleID, newOptionName, newValue);
		}
	} catch (e) {
		console.error(`Couldn't migrate storage ${oldKey} to ${newModuleID}::${newOptionName} via`, valueOrFunction, e);
	}
}

// This function compares a given option value to its "former default" -- the default
// before an attempted migration. Options aren't always a string, so equivalency won't
// work. Note that "option" needs to be the actual option object, NOT option.value.
function optionMatchesFormerDefaultValue(option, formerDefaultValue) {
	if (!option) {
		option = {
			type: 'legacy',
			value: undefined,
		};
	}
	const oldValue = option.value;

	// keyCodes once customized also save metaKey in a 5th index, but we used
	// to not store the metakey, so they have a length of 4 by default. In order
	// to do a proper array comparison, we need the lengths to match, so if a
	// 5th element is not present, push false into the array.
	if (oldValue && (option.type === 'keycode') && (option.value.length === 4)) {
		oldValue.push(false);
	}

	// Check if the oldValue differs from the former default value. If it doesn't,
	// then the user set something custom and we should honor that.
	return _.isEqual(formerDefaultValue, oldValue);
}

function updateValue(oldValue, valueOrFunction) {
	if (typeof valueOrFunction === 'function') {
		return valueOrFunction(oldValue);
	} else if (typeof valueOrFunction !== 'undefined') {
		return valueOrFunction;
	} else {
		return oldValue;
	}
}
