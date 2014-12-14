addModule('contexts', function (module, moduleID) {
	module.title = 'Contexts';
	module.category = 'Filters';
	module.description = 'Define certain contexts to allow actions on things like posts or comments.<br><br>\
		Scenes can also be called contexts, profiles, states, schedules.<br>\
		Actions include filtering, like hiding a subreddit between Friday and Tuesday to avoid spoilers.'

	module.options.toggle = {
		description: 'Enable or disable everything connected to a certain context, and provide a toggle in the RES gear dropdown menu',
		type: 'table',
		fields: [{
			name: 'context',
			type: 'text'
		}, {
			name: 'enabled',
			type: 'boolean',
			value: true,
		}, {
			name: 'menuItem',
			type: 'text'
		}]
	};
/*
	module.options.schedule = {
		type: 'table',
		fields: [{
			name: 'context',
			type: 'text'
		}, {
			name: 'start/end'
			type: 'enum',
			values: [{
				name: 'start',
				value: 'start'
			}, {
				name: 'end',
				name: 'end'
			}]
		}, {
			name: 'time of day (0-2359)',
			type: 'text',
		}, {
			name: 'day of month (1-31)',
			type: 'text',
		}, {
			name: 'month (1-12)',
			type: 'text',
		}, {
			name: 'day of week (1-7 Monday-Sunday)',
			type: 'text'
		}]
	};
	*/

	var _getByContext = {};
	function getOptionByContext(optionKey, context) {
		if (!_getByContext[optionKey]) {
			_getByContext[optionKey] = RESUtils.indexOptionTable(moduleID, optionKey, 0)
		}

		return _getByContext[optionKey](context);
	}


	var _getMenuItems;
	function getMenuItems(menuItemID) {
		if (!_getMenuItems) {
			_getMenuItems = RESUtils.indexOptionTable(moduleID, 'toggle', 2, true)
		}

		if (typeof menuItemID === "undefined") {
			return _getMenuItems;
		} else {
			return _getMenuItems(menuItemID);
		}
	};
	function getAllMenuItems() {
		return getMenuItems().all();
	}

	function getContextsForMenuItem(menuItemID) {
		var menuItems = getMenuItems(menuItemID);
		var contexts = menuItems
			.map(function(menuItem) {
				return menuItem[0]; // context
			});
		return contexts;
	}


	function anyTogglesEnabled(toggles) {
		var enabled = [].concat(toggles)
			.map(function(toggle) {
				return toggle[1]; // enabled
			});
		var anyEnabled = enabled.reduce(function(previousEnabled, enabled) {
				// If any toggle is enabled, then collection is enabled.
				// If all toggles are disabled, then collection is disabled
				return previousEnabled || enabled;
			}, false);
		return anyEnabled;
	};


	module.go = function() {
		createToggleMenuItems();
	};

	module.contextActive = function(context) {
		var active = true;
		if (module.isEnabled() && module.isMatchURL()) {
			var toggles = getOptionByContext('toggle', context);
			if (toggles && !anyTogglesEnabled(toggles)) {
				active = false;
			}
		}


		return active;
	};

	// var $menuItems = {};
	function createToggleMenuItems() {
		var menuItems = getAllMenuItems();
		menuItems.forEach(function(menuItem) {
			var menuItemID = menuItem[0][2];

			var $element = RESTemplates.getSync('contextToggleMenu').html({
				displayName: menuItemID,
				enabled: anyTogglesEnabled(menuItem)
			});
			$element.data('res-context-menuitem', menuItemID);

			$element.appendTo('#RESDropdownOptions');
		});

		$("#RESDropdownOptions").on('click', 'li', onClickToggleMenuItem);
	}
	function onClickToggleMenuItem() {
		var menuItemID = $(this).data('res-context-menuitem');
		if (typeof menuItemID === 'undefined') return;

		var enabled = module.toggleMenuItem(menuItemID);
		$(this).find(".toggleButton").toggleClass("enabled", enabled);
	}


	module.toggleMenuItem = function(menuItemID) {
		var contexts = getContextsForMenuItem(menuItemID);
		return module.toggleContexts(contexts);
	};

	module.toggleContexts = function(contexts) {
		var toggles = [].concat(contexts)
			.map(function(context) {
				return getOptionByContext('toggle', context)
			}).reduce(function(toggles, newToggles) {
				return toggles.concat(newToggles);
			}, []);

		var newEnabled = !anyTogglesEnabled(toggles);

		// Update cached settings
		toggles.forEach(function(toggle) {
			toggle[1] = newEnabled;
		});

		// Update settings in storage
		module.options.toggle.value.filter(function(toggle) {
			return contexts.indexOf(toggle[0]) !== -1;
		}).forEach(function(toggle) {
			toggle[1] = newEnabled;

		});
		RESUtils.setOption(moduleID, 'toggle', module.options.toggle.value);


		// Notify listeners
		toggles.forEach(function(toggle) {
			var context = toggle[0];
			if (newEnabled) {
				$(module).trigger($.Event('activated', { target: context }));
			} else {
				$(module).trigger($.Event('deactivated', { target: context }));
			}
		});

		return newEnabled;
	};
});
