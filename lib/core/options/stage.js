/* @flow */

import _ from 'lodash';
import { set } from './';

let stagedOptions;

clearStagedOptions();

export { stageOption as add };
function stageOption(moduleID: string, optionName: string, optionValue: mixed) {
	stagedOptions[moduleID] = stagedOptions[moduleID] || {};
	stagedOptions[moduleID][optionName] = {
		value: optionValue,
	};
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
