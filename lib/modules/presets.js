addModule('presets', function(module, moduleID) {
	module.moduleName = 'Presets';
	module.category = 'Core';
	module.alwaysEnabled = true;
	module.description = 'Select from various preset RES configurations. Each preset turns on or off various modules/options, but does not reset your entire configuration.';

	module.options.lite = {
		description: 'RES Lite: just the popular stuff',
		type: 'button',
		text: 'apply preset',
		callback() {
			modules['notifications'].showNotification({
				moduleID,
				optionKey: 'lite',
				message: 'Switched to RES Lite: just the popular stuff. Reload to see the result.'
			});
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
				'noParticipation'
			], '*');
		}
	};

	module.options.cleanSlate = {
		description: 'Turn off all the RES modules',
		type: 'button',
		text: 'apply preset',
		callback() {
			modules['notifications'].showNotification({
				moduleID,
				optionKey: 'cleanSlate',
				message: 'Turned off all RES modules! Reload to see the result.'
			});
			toggleModules(undefined, '*');
		}
	};

	module.options.noPopups = {
		description: 'Turn off notifications and hover pop-ups',
		type: 'button',
		text: 'apply preset',
		callback() {
			modules['notifications'].showNotification({
				moduleID,
				optionKey: 'noPopups',
				message: 'Turned off pop-ups! Reload to see the result.'
			});
			toggleModules(undefined, 'hover RESTips showParent subredditInfo '.split(/[,\s]/));
			toggleOptions(undefined, 'userTagger.hoverInfo'.split(/[,\s]/));
		}
	};


	function sanitizeModulesList(unsanitized) {
		let sanitized;
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
		let enable = sanitizeModulesList(requestEnable);
		let disable = sanitizeModulesList(requestDisable);

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

		disable.forEach(modId => RESUtils.options.enableModule(modId, false));
		enable.forEach(modId => RESUtils.options.enableModule(modId, true));
	}

	function allModules() {
		return Object.getOwnPropertyNames(modules);
	}

	function toggleOptions(requestEnable, requestDisable) {
		const enable = requestEnable ? [].concat(requestEnable) : [];
		const disable = requestDisable ? [].concat(requestDisable) : [];

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
