var RESUtils = RESUtils || {};

RESUtils.options = {};

RESUtils.options.listTypes = {};
RESUtils.options.listTypes['subreddits'] = {
	source: '/api/search_reddit_names.json?app=res',
	hintText: 'type a subreddit name',
	onResult: function(response) {
		var names = response.names,
			results = names.map(function(name) {
				return {
					id: name,
					name: name
				};
			});
		return results;
	},
	onCachedResult: function(response) {
		var names = response.names,
			results = names.map(function(name) {
				return {
					id: name,
					name: name
				};
			});
		return results;
	},
	sanitizeValues: function() {
		var values = Array.prototype.slice.call(arguments).reduce(function(a, b) { return a.concat(b); }, []);
		values = values.map(function(value) {
			if (value.split) {
				return value.split(/[\s,]/);
			}
			return value;
		}).reduce(function(a, b) { return a.concat(b); }, []);
		return values;
	}
};


RESUtils.options.table = {};

RESUtils.options.table.getMatchingValue = function(moduleID, optionKey, valueIdentifiers) {
	var option = modules[moduleID].options[optionKey];
	var values = option.value;
	if (option.type !== 'table' || !values || !values.length) return;

	return values.find(function(value) {
		var containValid = false;
		var match = option.fields.every(function(field, fi) {
			var fieldValue = value[fi];
			var matchValue = RESUtils.firstValid(valueIdentifiers[fi], valueIdentifiers[field.name]);

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
	var option = modules[moduleID].options[optionKey];
	if (option.type !== 'table') {
		console.error('Tried to save table value to non-table option: modules[\'' + moduleID + '\'].options.' + optionKey);
		return;
	}

	if (!option.value) {
		option.value = [];
	}
	var values = option.value;

	var optionValue = option.fields.map(function(field, i) {
		return RESUtils.firstValid(value[i], value[field.name], field.value);
	});

	values.push(optionValue);
	RESUtils.options.setOption(moduleID, optionKey, values);

	return optionValue;
};

RESUtils.options.table.getMatchingValueOrAdd = function(moduleID, optionKey, valueIdentifier, hydrateValue) {
	var matchingValue = RESUtils.options.table.getMatchingValue(moduleID, optionKey, valueIdentifier);
	if (!matchingValue) {
		var value = valueIdentifier;
		if (hydrateValue) {
			value = hydrateValue(valueIdentifier);
		}

		matchingValue = RESUtils.options.table.addValue(moduleID, optionKey, value);
	}

	return matchingValue;
};

RESUtils.options.table.mapValueToObject = function(moduleID, optionKey, value) {
	var option = modules[moduleID].options[optionKey];

	var object = {};
	option.fields.forEach(function(field, i) {
		object[field.name] = value[i];
	});

	return object;
};

$.extend(RESUtils.options, {
	resetModulePrefs: function() {
		this.setModulePrefs({});
	},
	getAllModulePrefs: function(force) {
		var storedPrefs;
		// if we've done this before, just return the cached version
		if ((!force) && (typeof this.getAllModulePrefsCached !== 'undefined')) {
			return this.getAllModulePrefsCached;
		}
		// get the stored preferences out first.
		if (RESStorage.getItem('RES.modulePrefs') !== null) {
			storedPrefs = safeJSON.parse(RESStorage.getItem('RES.modulePrefs'), 'RES.modulePrefs');
		} else if (RESStorage.getItem('modulePrefs') !== null) {
			// Clean up old moduleprefs.
			storedPrefs = safeJSON.parse(RESStorage.getItem('modulePrefs'), 'modulePrefs');
			RESStorage.removeItem('modulePrefs');
			this.setModulePrefs(storedPrefs);
		}
		if (!storedPrefs) {
			storedPrefs = {};
		}
		// create a new JSON object that we'll use to return all preferences. This is just in case we add a module, and there's no pref stored for it.
		var prefs = {};
		// for any stored prefs, drop them in our prefs JSON object.
		for (var module in modules) {
			if (storedPrefs[module]) {
				prefs[module] = storedPrefs[module];
			} else if (!modules[module].disabledByDefault &&
					(storedPrefs[module] === undefined ||
					storedPrefs[module] === null || module.alwaysEnabled)) {
				// looks like a new module, or no preferences. We'll default it to on.
				prefs[module] = true;
			} else {
				prefs[module] = false;
			}
		}
		this.getAllModulePrefsCached = prefs;
		return prefs;
	},
	getModulePrefs: function(moduleID) {
		if (moduleID) {
			var prefs = this.getAllModulePrefs();
			return prefs[moduleID];
		} else {
			alert('no module name specified for getModulePrefs');
		}
	},
	setModulePrefs: function(prefs) {
		if (prefs !== null) {
			RESStorage.setItem('RES.modulePrefs', JSON.stringify(prefs));
			return prefs;
		} else {
			alert('error - no prefs specified');
		}
	},
	getModuleIDsByCategory: function(category) {
		var moduleList = Object.getOwnPropertyNames(modules)
			.filter(function(moduleID) {
				return !modules[moduleID].hidden;
			})
			.filter(function(moduleID) {
				return [].concat(modules[moduleID].category).indexOf(category) !== -1;
			})
			.sort(function(moduleID1, moduleID2) {
				var a = modules[moduleID1];
				var b = modules[moduleID2];

				if (a.sort !== undefined || b.sort !== undefined) {
					var sortComparison = (a.sort || 0) - (b.sort || 0);
					if (sortComparison !== 0) {
						return sortComparison;
					}
				}

				if (a.moduleName.toLowerCase() > b.moduleName.toLowerCase()) return 1;
				return -1;
			});

		return moduleList;
	},
	enableModule: function(moduleID, onOrOff) {
		var module = modules[moduleID];
		if (!module) {
			console.warn('options.enableModule could not find module', moduleID);
			return;
		}
		if (module.alwaysEnabled && !onOrOff) {
			return;
		}

		var prefs = this.getAllModulePrefs(true);
		prefs[moduleID] = !! onOrOff;
		this.setModulePrefs(prefs);
		if (typeof module.onToggle === 'function') {
			modules[moduleID].onToggle(onOrOff);
		}
	},
	setOption: function(moduleID, optionName, optionValue) {
		if (/_[\d]+$/.test(optionName)) {
			optionName = optionName.replace(/_[\d]+$/, '');
		}
		var thisOptions = this.getOptions(moduleID);
		if (!thisOptions[optionName]) {
			console.warn('Could not find option', moduleID, optionName);
			return false;
		}

		var saveOptionValue;
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
		// save it to the object and to RESStorage
		RESUtils.options.saveModuleOptions(moduleID, thisOptions);
		return true;
	},
	saveModuleOptions: function(moduleID, newOptions) {
		function minify(obj) {
			var min = {};
			if (obj) {
				for (var key in obj) {
					if ('value' in obj[key]) {
						min[key] = {value: obj[key].value};
					}
				}
			}
			return min;
		}
		if (newOptions) {
			modules[moduleID].options = newOptions;
		}
		RESStorage.setItem('RESoptions.' + moduleID, JSON.stringify(minify(modules[moduleID].options)));
	},
	loadOptions: function(moduleID) {
		var needsStorage = Object.getOwnPropertyNames(modules[moduleID].options || {}).some(function(optionKey) {
			var type = modules[moduleID].options[optionKey].type;
			return type !== 'button';
		});

		if (needsStorage) {
			return RESStorage.loadItem('RESoptions.' + moduleID)
				.then(RESUtils.options.getOptions.bind(RESUtils.options, moduleID));
		} else {
			return $.Deferred().resolve(modules[moduleID].options);
		}
	},
	getOptionsFirstRun: {},
	getOptions: function(moduleID, keepObsoleteOptions) {
		if (this.getOptionsFirstRun[moduleID]) {
			// we've already grabbed these out of localstorage, so modifications should be done in memory. just return that object.
			return modules[moduleID].options;
		}
		$.each(modules[moduleID].options || {}, function(key, opt) {
			opt.default = opt.value;
		});
		var rawOptions = RESStorage.getItem('RESoptions.' + moduleID);
		if (rawOptions && rawOptions !== 'undefined') {
			// merge options (in case new ones were added via code) and if anything has changed, update to localStorage
			var storedOptions = safeJSON.parse(rawOptions, 'RESoptions.' + moduleID);
			var codeOptions = modules[moduleID].options;
			var newOption = false;
			for (var attrname in codeOptions) {
				if (typeof storedOptions[attrname] === 'undefined') {
					newOption = true;
				} else {
					codeOptions[attrname].value = storedOptions[attrname].value;
				}
			}
			if (keepObsoleteOptions === true) {
				modules[moduleID].hasObsoleteOptions = true;
				for (var optName in storedOptions) {
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
		this.getOptionsFirstRun[moduleID] = true;
		return modules[moduleID].options;
	},
	removeObsoleteOptions: function(moduleID) {
		if (typeof moduleID === 'undefined') {
			for (moduleID in modules) {
				RESUtils.options.removeObsoleteOptions(moduleID);
			}
			return;
		}

		if (modules[moduleID].hasObsoleteOptions) {
			var moduleOptions = modules[moduleID].options;
			for (var opt in moduleOptions) {
				if (moduleOptions[opt].obsolete) {
					delete moduleOptions[opt];
				}
			}
			modules[moduleID].hasObsoleteOptions = false;
		}
	}
});

(function(module) {
	var stagedOptions;

	clearStagedOptions();

	function stageOption(moduleID, optionName, optionValue) {
		stagedOptions[moduleID] = stagedOptions[moduleID] || {};
		stagedOptions[moduleID][optionName] = {
			value: optionValue
		};
	}
	function commitStagedOptions() {
		$.each(stagedOptions, function(moduleID, module) {
			$.each(module, function(optionName, option) {
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
