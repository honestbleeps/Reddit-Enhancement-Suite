import { Modules } from '../';
import { firstValid } from '../../utils';
import { set } from './';

function getMatchingValue(module, optionKey, valueIdentifiers) {
	const option = module.options[optionKey];
	const values = option.value;
	if (option.type !== 'table' || !values || !values.length) return undefined;

	return values.find(value => {
		let containValid = false;
		const match = option.fields.every((field, fi) => {
			const fieldValue = value[fi];
			const matchValue = firstValid(valueIdentifiers[fi], valueIdentifiers[field.name]);

			if (matchValue === undefined) {
				return true;
			}

			if (matchValue === fieldValue) {
				containValid = true;
				return true;
			}

			return false;
		});

		return match && containValid;
	});
}

function addValue(module, optionKey, value) {
	const option = module.options[optionKey];
	if (option.type !== 'table') {
		console.error(`Tried to save table value to non-table option: modules['${module.moduleID}'].options.${optionKey}`);
		return undefined;
	}

	if (!option.value) {
		option.value = [];
	}
	const values = option.value;

	const optionValue = option.fields.map((field, i) => firstValid(value[i], value[field.name], field.value));

	values.push(optionValue);
	set(module, optionKey, values);

	return optionValue;
}

export function getMatchingValueOrAdd(opaqueId, optionKey, valueIdentifier, hydrateValue) {
	const module = Modules.get(opaqueId);

	let matchingValue = getMatchingValue(module, optionKey, valueIdentifier);
	if (!matchingValue) {
		let value = valueIdentifier;
		if (hydrateValue) {
			value = hydrateValue(valueIdentifier);
		}

		matchingValue = addValue(module, optionKey, value);
	}

	return matchingValue;
}

export function mapValueToObject(option, value) {
	const object = {};
	option.fields.forEach((field, i) => (object[field.name] = value[i]));

	return object;
}
