addModule('presets', function(module, moduleID) {
	module.moduleName = 'Presets';
	module.category = 'Core';
	module.alwaysEnabled = true;
	module.description = 'Select from various preset RES configurations. Each preset turns on or off various modules/options, but does not reset your entire configuration.';

	module.options.lite = {
		description: 'RES Lite: just the popular stuff',
		type: 'button',
		text: 'apply preset',
		callback: function() {
			toggleModules([
				'notifications',
				'hover',
				'announcements',
				'orangered',
				'onboarding',
				'selectedEntry',
				'showImages',
				'submitHelper',
				'neverEndingReddit',
				'accountSwitcher',
				'filteReddit',
				'quickMessage',
				'subredditInfo',
				'userInfo',
				'userHighlight',
				'searchHelper',
				'betteReddit',
				'styleTweaks',
				'pageNavigator',
				'commandLine',
				'commentHidePersistor',
				'commentTools',
				'commentPreview',
				'localDate',
				'noParticipation',
			], '*');
		}
	};

	module.options.cleanSlate = {
		description: 'Turn off all the RES modules',
		type: 'button',
		text: 'apply preset',
		callback: function() {
			toggleModules(undefined, '*');
		}
	};

	module.options.noPopups = {
		description: 'Turn off notifications and hover pop-ups',
		type: 'button',
		text: 'apply preset',
		callback: function() {
			toggleModules(undefined, 'hover RESTips showParent subredditInfo '.split(/[,\s]/));
			toggleOptions(undefined, 'userTagger.hoverInfo'.split(/[,\s]/));

		}
	};

	module.loadDynamicOptions = function() {
		for (var optionName in module.options) {
			if (typeof module.options[optionName].callback !== 'function') {
				continue;
			}

			module.options[optionName].callback = confirmPreset.bind(this, module.options[optionName].callback);
		}

		module.options.resetToFactory = modules['troubleshooter'].options.resetToFactory;
	};

	function confirmPreset(callback, optionName, option) {
		var confirmation = prompt('Are you sure you want to apply the "' + optionName + '" preset? Type "yes" to continue.');
		if (/^"?yes"?$/.test(confirmation)) {
			presetApplied(optionName, option);
			callback();
		} else {
			presetCancelled();
		}
	}

	function presetApplied(optionName, option) {
		modules['notifications'].showNotification({
			moduleID: moduleID,
			optionKey: optionName,
			title: 'Applied ' + optionName + ' preset',
			message: 'Applied preset: ' + option.description + '\n<p>Reload page to see results.</p>'
		});
	}

	function presetCancelled(optionName, option) {
		modules['notifications'].showNotification({
			moduleID: moduleID,
			optionKey: optionName,
			title: 'Preset cancelled',
			message: 'If you really wanted to apply this preset, make sure to type in "yes" when prompted.'
		});
	}


	function sanitizeModulesList(unsanitized) {
		var sanitized;
		if (unsanitized === '*') {
			sanitized = allModules();
		} else if (typeof unsanitized === 'string') {
			sanitized = unsanitized.split(/[,\s]/);
		} else if (unsanitized && unsanitized.length) {
			sanitized = unsanitized;
		}
		sanitized = sanitized ? [].concat(sanitized) : [];

		return sanitized;
	}

	function toggleModules(requestEnable, requestDisable) {
		var enable, disable;
		enable = sanitizeModulesList(requestEnable);
		disable = sanitizeModulesList(requestDisable);

		disable = requestEnable !== '*' ?
			disable.filter(function(moduleID) {
				return enable.indexOf(moduleID) === -1;
			}) :
			disable;

		enable = requestDisable !== '*' ?
			enable.filter(function(moduleID) {
				return disable.indexOf(moduleID) === -1;
			}) :
			enable;

		disable.forEach(function(moduleID) {
			RESUtils.options.enableModule(moduleID, false);
		});
		enable.forEach(function(moduleID) {
			RESUtils.options.enableModule(moduleID, true);
		});
	}

	function allModules() {
		return Object.getOwnPropertyNames(modules);
	}

	function toggleOptions(requestEnable, requestDisable) {
		var enable, disable;
		enable = requestEnable ? [].concat(requestEnable) : [];
	 	disable = requestDisable ? [].concat(requestDisable) : [];

	 	enable.forEach(setOptionValue.bind(this, true));
	 	disable.forEach(setOptionValue.bind(this, false));
	 }
 	function setOptionValue(value, path) {
 		// path = [moduleID, optionName] or 'moduleID.optionName'
 		if (typeof path === 'string') {
 			path = path.split('.');
 		}
 		RESUtils.options.setOption.apply(RESUtils.options, [].concat(path).concat(value));
 	}
});
