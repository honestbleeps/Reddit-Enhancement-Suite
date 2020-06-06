/* @flow */

import { isEmpty, isEqual, omitBy } from 'lodash-es';
import * as Modules from '../modules';
import { filterMap } from '../../utils';

function getModified() {
	return filterMap(Modules.all(), module => {
		const { moduleID, options } = module;

		const enabledByDefault = !module.disabledByDefault;
		const isEnabled = Modules.isEnabled(module);
		const moduleStatusChanged = enabledByDefault !== isEnabled;

		const modifiedOptions = isEnabled ? omitBy(options, v => isEqual(v.value, v.default)) : {};

		if (!isEmpty(modifiedOptions) || moduleStatusChanged) {
			return [{
				moduleID,
				modifiedOptions,
				moduleStatus: moduleStatusChanged ? `${enabledByDefault ? 'on' : 'off'} → ${isEnabled ? 'on' : 'off'}` : '',
			}];
		}
	});
}

export function getModifiedText(types: Array<*> = ['text', 'boolean', 'enum']) {
	const lines = [];
	let optionMaxLength = 0;
	let moduleMaxLength = 0;

	for (const { moduleID, modifiedOptions, moduleStatus } of getModified()) {
		moduleMaxLength = Math.max(moduleMaxLength, moduleID.length);
		optionMaxLength = Math.max(optionMaxLength, ...Object.keys(modifiedOptions).map(v => v.length));

		lines.push(() =>
			[
				`    ${moduleID.padEnd(moduleMaxLength)} ${moduleStatus}`,
				...Object.entries(modifiedOptions)
					.filter(([, { type }]) => types.includes(type))
					.map(([key, value]) => (
						`      ${key.padEnd(optionMaxLength)}\t${JSON.stringify(value.default)} → ${JSON.stringify(value.value)}`
					)),
			],
		);
	}

	// $FlowIssue Array#flat
	return lines.map(v => v()).flat(2).join('\n');
}
