import { $ } from './global';

RESUtils.options = {};

RESUtils.options.listTypes = {};
RESUtils.options.listTypes['subreddits'] = {
	source: '/api/search_reddit_names.json?app=res',
	hintText: 'type a subreddit name',
	onResult(response) {
		const names = response.names;
		return names.map(name => ({
			id: name,
			name
		}));
	},
	onCachedResult(response) {
		const names = response.names;
		return names.map(name => ({
			id: name,
			name
		}));
	},
	sanitizeValues(...values) {
		return values
			.reduce((a, b) => a.concat(b), [])
			.map(value => {
				if (value.split) {
					return value.split(/[\s,]/);
				}
				return value;
			})
			.reduce((a, b) => a.concat(b), []);
	}
};


RESUtils.options.table = {};

RESUtils.options.table.getMatchingValue = function(moduleID, optionKey, valueIdentifiers) {
	const option = modules[moduleID].options[optionKey];
	const values = option.value;
	if (option.type !== 'table' || !values || !values.length) return undefined;

	return values.find(value => {
		let containValid = false;
		const match = option.fields.every((field, fi) => {
			const fieldValue = value[fi];
			const matchValue = RESUtils.firstValid(valueIdentifiers[fi], valueIdentifiers[field.name]);

			if (matchValue === undefined) {
				return true;
			}

			if (matchValue === fieldValue) {
				containValid = true;
				return true;
			}

			return false;
		});

		return match && containValid;
	});
};

RESUtils.options.table.addValue = function(moduleID, optionKey, value) {
	const option = modules[moduleID].options[optionKey];
	if (option.type !== 'table') {
		console.error(`Tried to save table value to non-table option: modules['${moduleID}'].options.${optionKey}`);
		return undefined;
	}

	if (!option.value) {
		option.value = [];
	}
	const values = option.value;

	const optionValue = option.fields.map((field, i) => RESUtils.firstValid(value[i], value[field.name], field.value));

	values.push(optionValue);
	RESUtils.options.setOption(moduleID, optionKey, values);

	return optionValue;
};

RESUtils.options.table.getMatchingValueOrAdd = function(moduleID, optionKey, valueIdentifier, hydrateValue) {
	let matchingValue = RESUtils.options.table.getMatchingValue(moduleID, optionKey, valueIdentifier);
	if (!matchingValue) {
		let value = valueIdentifier;
		if (hydrateValue) {
			value = hydrateValue(valueIdentifier);
		}

		matchingValue = RESUtils.options.table.addValue(moduleID, optionKey, value);
	}

	return matchingValue;
};

RESUtils.options.table.mapValueToObject = function(moduleID, optionKey, value) {
	const option = modules[moduleID].options[optionKey];

	const object = {};
	option.fields.forEach((field, i) => (object[field.name] = value[i]));

	return object;
};

$.extend(RESUtils.options, {
	getAllModulePrefs: RESUtils.once(async () => {
		const storedPrefs = await RESEnvironment.storage.get('RES.modulePrefs') || {};
		// create a new JSON object that we'll use to return all preferences. This is just in case we add a module, and there's no pref stored for it.
		const prefs = {};
		// for any stored prefs, drop them in our prefs JSON object.
		for (const module in modules) {
			if (module in storedPrefs) {
				prefs[module] = storedPrefs[module];
			} else {
				prefs[module] = !modules[module].disabledByDefault;
			}
		}

		return prefs;
	}),
	async getModulePrefs(moduleID) {
		if (!moduleID) {
			throw new Error('no module name specified');
		}
		const prefs = await this.getAllModulePrefs();
		const enabled = prefs[moduleID];
		// set enabled state of module
		modules[moduleID]._enabled = enabled;
		return enabled;
	},
	getModuleIDsByCategory(category) {
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
	},
	enableModule(moduleID, onOrOff) {
		const module = modules[moduleID];
		if (!module) {
			console.warn('could not find module', moduleID);
			return;
		}
		if (module.alwaysEnabled && !onOrOff) {
			return;
		}
		onOrOff = !!onOrOff;
		// set enabled state of module
		module._enabled = onOrOff;
		RESEnvironment.storage.patch('RES.modulePrefs', { [moduleID]: onOrOff });
		modules[moduleID].onToggle(onOrOff);
	},
	async setOption(moduleID, optionName, optionValue) {
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
		const storedOptions = await this.getOptions(moduleID);
		storedOptions[optionName].value = saveOptionValue;
		RESUtils.options.saveModuleOptions(moduleID, storedOptions);
		return true;
	},
	saveModuleOptions(moduleID, newOptions) {
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
		RESEnvironment.storage.set(`RESoptions.${moduleID}`, minify(modules[moduleID].options));
	},
	getOptions: RESUtils.memoize(async (moduleID, keepObsoleteOptions) => {
		// braces necessary here because $.each will stop if you return false
		$.each(modules[moduleID].options || {}, (key, opt) => { opt.default = opt.value; });
		const storedOptions = await RESEnvironment.storage.get(`RESoptions.${moduleID}`);
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
				RESUtils.options.saveModuleOptions(moduleID);
			}
		} else {
			// nothing in localStorage, let's set the defaults...
			RESUtils.options.saveModuleOptions(moduleID);
		}
		return modules[moduleID].options;
	}),
	removeObsoleteOptions(moduleID) {
		if (typeof moduleID === 'undefined') {
			for (moduleID in modules) {
				RESUtils.options.removeObsoleteOptions(moduleID);
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
});

(function(module) {
	let stagedOptions;

	clearStagedOptions();

	function stageOption(moduleID, optionName, optionValue) {
		stagedOptions[moduleID] = stagedOptions[moduleID] || {};
		stagedOptions[moduleID][optionName] = {
			value: optionValue
		};
	}
	function commitStagedOptions() {
		$.each(stagedOptions, (moduleID, module) => {
			$.each(module, (optionName, option) => {
				RESUtils.options.setOption(moduleID, optionName, option.value);
			});
		});
		clearStagedOptions();
	}
	function clearStagedOptions() {
		stagedOptions = {};
	}

	function hasStagedOptions() {
		return Object.getOwnPropertyNames(stagedOptions).length;
	}

	function getOptions(moduleID) {
		return stagedOptions[moduleID];
	}

	module.reset = clearStagedOptions;
	module.add = stageOption;
	module.commit = commitStagedOptions;
	module.isDirty = hasStagedOptions;
	module.get = getOptions;
})(RESUtils.options.stage = RESUtils.options.stage || {});
