import { firstValid } from '../../utils';
import { getModuleWithId, setOption } from '../';

function getMatchingValue(moduleID, optionKey, valueIdentifiers) {
	const option = getModuleWithId(moduleID).options[optionKey];
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

function addValue(moduleID, optionKey, value) {
	const option = getModuleWithId(moduleID).options[optionKey];
	if (option.type !== 'table') {
		console.error(`Tried to save table value to non-table option: modules['${moduleID}'].options.${optionKey}`);
		return undefined;
	}

	if (!option.value) {
		option.value = [];
	}
	const values = option.value;

	const optionValue = option.fields.map((field, i) => firstValid(value[i], value[field.name], field.value));

	values.push(optionValue);
	setOption(moduleID, optionKey, values);

	return optionValue;
}

export function getMatchingValueOrAdd(moduleID, optionKey, valueIdentifier, hydrateValue) {
	let matchingValue = getMatchingValue(moduleID, optionKey, valueIdentifier);
	if (!matchingValue) {
		let value = valueIdentifier;
		if (hydrateValue) {
			value = hydrateValue(valueIdentifier);
		}

		matchingValue = addValue(moduleID, optionKey, value);
	}

	return matchingValue;
}

export function mapValueToObject(option, value) {
	const object = {};
	option.fields.forEach((field, i) => (object[field.name] = value[i]));

	return object;
}
