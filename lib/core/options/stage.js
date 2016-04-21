import { set } from './';

let stagedOptions;

clearStagedOptions();

export { stageOption as add };
function stageOption(moduleID, optionName, optionValue) {
	stagedOptions[moduleID] = stagedOptions[moduleID] || {};
	stagedOptions[moduleID][optionName] = {
		value: optionValue
	};
}

export { commitStagedOptions as commit };
function commitStagedOptions() {
	for (const module of Object.values(stagedOptions)) {
		for (const [optionName, option] of Object.entries(module)) {
			set(module, optionName, option.value);
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
	return Object.getOwnPropertyNames(stagedOptions).length;
}

export { getStagedOptions as get };
function getStagedOptions(moduleID) {
	return stagedOptions[moduleID];
}
