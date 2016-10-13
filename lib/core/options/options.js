/* @flow */

import _ from 'lodash';
import { flow } from 'lodash/fp';
import * as Modules from '../modules';
import { Storage } from '../../environment';
import type { OpaqueModuleId } from '../module';
import { filterMap } from '../../utils';

function getKey(module) {
	return `RESoptions.${module.moduleID}`;
}

export async function _loadModuleOptions() {
	const allOptions = await Storage.batch(Modules.all().map(mod => getKey(mod)));

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
		// skip unsaved options (keep default value)
		if (!storedOptions[key]) continue;

		// skip obsolete options
		if (!module.options[key]) continue;

		// normal option, copy in the value from storage
		module.options[key].value = storedOptions[key].value;
	}
}, module => module.moduleID);

export const loadRaw = flow(
	(opaqueId: OpaqueModuleId) => Modules.get(opaqueId),
	_.memoize(
		module => Storage.get(getKey(module)),
		module => module.moduleID
	)
);

export function set(opaqueId: OpaqueModuleId, optionKey: string, value: mixed) {
	if (/_[\d]+$/.test(optionKey)) {
		optionKey = optionKey.replace(/_[\d]+$/, '');
	}

	const module = Modules.get(opaqueId);

	if (!module.options[optionKey]) {
		console.warn('Could not find option', module.moduleID, optionKey);
		return false;
	}

	// save value to module options and storage
	module.options[optionKey].value = value;
	Storage.patch(getKey(module), { [optionKey]: { value } });

	if (module.options[optionKey].onChange) {
		// Intentionally do not pass in the new value
		// so that it must be read out of `module.options[key].value`
		// for easier grepping (and to enforce stricter types where possible).
		module.options[optionKey].onChange();
	}

	return true;
}

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
				`    ${_.padEnd(moduleID, moduleMaxLength)} ${moduleStatus}`,
				...Object.entries(modifiedOptions)
					.filter(([, { type }]) => types.includes(type))
					.map(([key, value]) => (
						`      ${_.padEnd(key, optionMaxLength)}\t${JSON.stringify(value.default)} → ${JSON.stringify(value.value)}`
					)),
			]
		);
	}

	return _.flatten(lines.map(v => v())).join('\n');
}
