/* @flow */

import * as Modules from '../modules';
import { firstValid } from '../../utils';
import type { OpaqueModuleId } from '../module';
import { set } from './options';

export function getMatchingValueOrAdd(
	opaqueId: OpaqueModuleId,
	optionKey: string,
	valueIdentifier: *,
	_default?: *,
) {
	const module = Modules.get(opaqueId);

	const option = module.options[optionKey];
	if (option.type !== 'table') {
		throw new Error(`Tried to save table value to non-table option: modules.${module.moduleID}.options.${optionKey}`);
	}

	let row = option.value.find(value =>
		option.fields.every((field, i) => !valueIdentifier.hasOwnProperty(field.key) || value[i] === valueIdentifier[field.key])
	);

	if (!row) {
		const value = { ...valueIdentifier, ..._default };
		row = option.fields.map(field => firstValid(value[field.key], field.value));
		option.value.push(row);
		set(module, optionKey, option.value);
	}

	return option.fields.reduce((acc, field, i) => {
		Object.defineProperty(acc, field.key, {
			get: () => row[i],
			set: v => { row[i] = v; },
		});
		return acc;
	}, {});
}
