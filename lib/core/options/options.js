import _ from 'lodash';
import { $ } from '../../vendor';
import { storage } from 'environment';

export function getModuleIDsByCategory(category) {
	return Object.getOwnPropertyNames(modules)
		.filter(moduleID => !modules[moduleID].hidden)
		.filter(moduleID => [].concat(modules[moduleID].category).indexOf(category) !== -1)
		.sort((moduleID1, moduleID2) => {
			const a = modules[moduleID1];
			const b = modules[moduleID2];

			if (a.sort !== undefined || b.sort !== undefined) {
				const sortComparison = (a.sort || 0) - (b.sort || 0);
				if (sortComparison !== 0) {
					return sortComparison;
				}
			}

			if (a.moduleName.toLowerCase() > b.moduleName.toLowerCase()) return 1;
			return -1;
		});
}

export async function setOption(moduleID, optionName, optionValue) {
	if (/_[\d]+$/.test(optionName)) {
		optionName = optionName.replace(/_[\d]+$/, '');
	}
	const thisOptions = modules[moduleID].options;
	if (!thisOptions[optionName]) {
		console.warn('Could not find option', moduleID, optionName);
		return false;
	}

	let saveOptionValue;
	if (optionValue === '') {
		saveOptionValue = '';
	} else if ((isNaN(optionValue)) || (typeof optionValue === 'boolean') || (typeof optionValue === 'object')) {
		saveOptionValue = optionValue;
	} else if (optionValue.indexOf && optionValue.indexOf('.') !== -1) {
		saveOptionValue = parseFloat(optionValue);
	} else {
		saveOptionValue = parseInt(optionValue, 10);
	}
	thisOptions[optionName].value = saveOptionValue;
	// update storage
	const storedOptions = await getOptions(moduleID);
	storedOptions[optionName].value = saveOptionValue;
	saveModuleOptions(moduleID, storedOptions);
	return true;
}

export function saveModuleOptions(moduleID, newOptions) {
	function minify(obj) {
		const min = {};
		if (obj) {
			for (const key in obj) {
				if ('value' in obj[key]) {
					min[key] = { value: obj[key].value };
				}
			}
		}
		return min;
	}
	if (newOptions) {
		modules[moduleID].options = newOptions;
	}
	storage.set(`RESoptions.${moduleID}`, minify(modules[moduleID].options));
}

export const getOptions = _.memoize(async (moduleID, keepObsoleteOptions) => {
	// braces necessary here because $.each will stop if you return false
	$.each(modules[moduleID].options || {}, (key, opt) => { opt.default = opt.value; });
	const storedOptions = await storage.get(`RESoptions.${moduleID}`);
	if (storedOptions) {
		// merge options (in case new ones were added via code) and if anything has changed, update to localStorage
		const codeOptions = modules[moduleID].options;
		let newOption = false;
		for (const attrname in codeOptions) {
			if (typeof storedOptions[attrname] === 'undefined') {
				newOption = true;
			} else {
				codeOptions[attrname].value = storedOptions[attrname].value;
			}
		}
		if (keepObsoleteOptions === true) {
			modules[moduleID].hasObsoleteOptions = true;
			for (const optName in storedOptions) {
				if (codeOptions[optName] === undefined) {
					codeOptions[optName] = storedOptions[optName];
					codeOptions[optName].obsolete = true;
				}
			}
		}
		modules[moduleID].options = codeOptions;
		if (newOption) {
			saveModuleOptions(moduleID);
		}
	} else {
		// nothing in localStorage, let's set the defaults...
		saveModuleOptions(moduleID);
	}
	return modules[moduleID].options;
});

export function removeObsoleteOptions(moduleID) {
	if (typeof moduleID === 'undefined') {
		for (moduleID in modules) {
			removeObsoleteOptions(moduleID);
		}
		return;
	}

	if (modules[moduleID].hasObsoleteOptions) {
		const moduleOptions = modules[moduleID].options;
		for (const opt in moduleOptions) {
			if (moduleOptions[opt].obsolete) {
				delete moduleOptions[opt];
			}
		}
		modules[moduleID].hasObsoleteOptions = false;
	}
}
