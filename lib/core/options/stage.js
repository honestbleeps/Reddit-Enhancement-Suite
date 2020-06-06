/* @flow */

import { isEmpty, isEqual } from 'lodash-es';
import * as Modules from '../modules';
import { save } from './options';

let stagedOptions;

clearStagedOptions();

export { stageOption as add };
function stageOption(moduleID: string, optionName: string, optionValue: mixed) {
	const mod = Modules.get(moduleID);

	stagedOptions[moduleID] = stagedOptions[moduleID] || {};

	if (!isEqual(mod.options[optionName].value, optionValue)) {
		// new option value, add to stage
		stagedOptions[moduleID][optionName] = {
			value: optionValue,
		};
	} else {
		// staged value is the same as stored, remove option from stage
		delete stagedOptions[moduleID][optionName];
	}

	if (isEmpty(stagedOptions[moduleID])) {
		// no staged options for module, remove module from stage
		delete stagedOptions[moduleID];
	}
}

export { commitStagedOptions as commit };
function commitStagedOptions() {
	for (const [modId, options] of Object.entries(stagedOptions)) {
		const module = Modules.get(modId);

		for (const [optionName, option] of Object.entries(options)) {
			const _option = module.options[optionName];
			_option.value = option.value;
			save(_option);
		}

		module.onSaveSettings(options);
	}

	clearStagedOptions();
}

export { clearStagedOptions as reset };
function clearStagedOptions() {
	stagedOptions = {};
}

export { hasStagedOptions as isDirty };
function hasStagedOptions() {
	return !isEmpty(stagedOptions);
}

export { getStagedOptions as get };
function getStagedOptions(moduleID: string) {
	return stagedOptions[moduleID];
}
