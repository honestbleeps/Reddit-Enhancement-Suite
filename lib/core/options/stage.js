/* @flow */

import _ from 'lodash';
import * as Modules from '../modules';
import { set } from './';

let stagedOptions;

clearStagedOptions();

export { stageOption as add };
function stageOption(moduleID: string, optionName: string, optionValue: mixed) {
	const mod = Modules.get(moduleID);

	stagedOptions[moduleID] = stagedOptions[moduleID] || {};

	if (!_.isEqual(mod.options[optionName].value, optionValue)) {
		// new option value, add to stage
		stagedOptions[moduleID][optionName] = {
			value: optionValue,
		};
	} else {
		// staged value is the same as stored, remove option from stage
		delete stagedOptions[moduleID][optionName];
	}

	if (_.isEmpty(stagedOptions[moduleID])) {
		// no staged options for module, remove module from stage
		delete stagedOptions[moduleID];
	}
}

export { commitStagedOptions as commit };
function commitStagedOptions() {
	for (const [modId, options] of Object.entries(stagedOptions)) {
		for (const [optionName, option] of Object.entries(options)) {
			set(modId, optionName, option.value);
		}
	}
	clearStagedOptions();
}

export { clearStagedOptions as reset };
function clearStagedOptions() {
	stagedOptions = {};
}

export { hasStagedOptions as isDirty };
function hasStagedOptions() {
	return !_.isEmpty(stagedOptions);
}

export { getStagedOptions as get };
function getStagedOptions(moduleID: string) {
	return stagedOptions[moduleID];
}
