/* @flow */

import * as Modules from '../modules';
import { firstValid, zip } from '../../utils';
import type { OpaqueModuleId, TableOption } from '../module';
import { set } from './';

function getMatchingValue(module, optionKey, valueIdentifiers) {
	const option = module.options[optionKey];
	const values = option.value;
	if (option.type !== 'table' || !values || !values.length) return;

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
		throw new Error(`Tried to save table value to non-table option: modules.${module.moduleID}.options.${optionKey}`);
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

export function getMatchingValueOrAdd<T: { [key: string]: mixed }>(
	opaqueId: OpaqueModuleId,
	optionKey: string,
	valueIdentifier: T,
	hydrateValue?: (val: T) => { [key: string]: mixed } = x => x
) {
	const module = Modules.get(opaqueId);

	let matchingValue = getMatchingValue(module, optionKey, valueIdentifier);
	if (!matchingValue) {
		const value = hydrateValue(valueIdentifier);
		matchingValue = addValue(module, optionKey, value);
	}

	return matchingValue;
}

export function mapValueToObject<T: any[]>(option: TableOption<T>, value: T[]): { [key: string]: mixed } {
	const object = {};

	for (const [field, val] of zip(option.fields, value)) {
		object[field.name] = val;
	}

	return object;
}
