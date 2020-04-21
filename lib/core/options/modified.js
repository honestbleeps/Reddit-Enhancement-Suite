/* @flow */

import * as Modules from '../modules';
import { filterMap } from '../../utils';
import _ from 'lodash';

function getModified() {
	return filterMap(Modules.all(), module => {
		const { moduleID, options } = module;

		const enabledByDefault = !module.disabledByDefault;
		const isEnabled = Modules.isEnabled(module);
		const moduleStatusChanged = enabledByDefault !== isEnabled;

		const modifiedOptions = isEnabled ? _.omitBy(options, v => _.isEqual(v.value, v.default)) : {};

		if (!_.isEmpty(modifiedOptions) || moduleStatusChanged) {
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

	return _.flatten(lines.map(v => v())).join('\n');
}
