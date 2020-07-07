/* @flow */

import { isEmpty, isEqual, omitBy } from 'lodash-es';
import * as Modules from '../modules';
import { niceKeyCode, filterMap } from '../../utils';

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

export function getModifiedText(censorOptions: Array<string> = ['backupAndRestore/googleAccount']) {
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
					.map(([key, { value: _current, default: _default, type }]) => {
						const asText = v =>
							['text', 'boolean', 'enum', 'select', 'color'].includes(type) ? JSON.stringify(v) :
							['list', 'table', 'builder'].includes(type) ? v.length :
							['keycode'].includes(type) ? niceKeyCode(v) :
							'***UNKNOWN TYPE***';
						const defaultText = asText(_default);
						const currentText = censorOptions.includes(`${moduleID}/${key}`) ? '***CENSORED***' : asText(_current);
						return `      ${key.padEnd(optionMaxLength)}\t${defaultText} → ${currentText}`;
					}),
			],
		);
	}

	// $FlowIssue Array#flat
	return lines.map(v => v()).flat(2).join('\n');
}
