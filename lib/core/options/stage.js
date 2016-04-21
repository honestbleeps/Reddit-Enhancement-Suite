import { $ } from '../../vendor';
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
	$.each(stagedOptions, (moduleID, module) => {
		$.each(module, (optionName, option) => {
			set(moduleID, optionName, option.value);
		});
	});
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
