var RESOptionsMigrate = {
	lastVersion: 2,
	/*
		If you need to migrate some stuff, increase the RESOptionsLastVersion variable by one.
		Then, add this code to the switch:
			case x:
				code to execute to migrate the data
		just before the
			default:
		where x is the RESOptionsLastVersion number before you increase it by one.
		Use RESOptionsMigrate to migrate data if you just want to move an option.
	*/
	migrate: function() {
		var RESOptionsVersion = RESOptionsMigrate.getOptionsVersion();

		switch (RESOptionsVersion) {
			case -1: // It's the first time we install RES, there is nothing to migrate
				break;

			case 0: // Before migrate.js was implemented (i.e. before v4.5.0.0)
				RESOptionsMigrate.f.generic.moveOption('betteReddit', 'searchSubredditByDefault', 'searchHelper', 'searchSubredditByDefault');

				RESOptionsMigrate.f.generic.moveOption('styleTweaks', 'lightSwitch', 'nightMode', 'nightSwitch');
				RESOptionsMigrate.f.generic.moveOption('styleTweaks', 'lightOrDark', 'nightMode', 'nightModeOn',
					RESOptionsMigrate.f.specific.nightModeOn);
				RESOptionsMigrate.f.generic.moveOption('styleTweaks', 'useSubredditStyleInDarkMode', 'nightMode', 'useSubredditStyles');
				RESOptionsMigrate.f.generic.moveStorageToOption('RESmodules.styleTweaks.nightModeWhitelist',
					'nightMode', 'subredditStylesWhitelist',
					RESOptionsMigrate.f.specific.subredditStylesWhitelist);

			case 1: // v4.5.1
				RESOptionsMigrate.f.generic.updateOption('voteEnhancements', 'colorCommentScore', RESOptionsMigrate.f.specific.colorScoreComment);

			case 2:

			case 3:

			case 4:

			default:
				RESStorage.setItem('RESOptionsVersion', this.lastVersion);
			break;
		}
	},
	getOptionsVersion: function() {
		var RESOptionsVersion = RESStorage.getItem('RESOptionsVersion'),
			hasMigrateRun = (RESOptionsVersion !== null);

		if (!hasMigrateRun) {
			// Assume that users have v4.3.2.1 before upgrading to a later version
			var newInstall = !RESStorage.getItem('RES.firstRun.4.3.2.1');

			RESOptionsVersion = newInstall ? -1 : 0;
		}

		return RESOptionsVersion;
	},
	f: { // Migration functions
		generic: { // Generic migration function
			updateOption: function(moduleID, optionName, valueOrFunction) {
				try {
					var oldValue = RESUtils.getOptions(moduleID)[optionName].value;
					var newValue = RESOptionsMigrate.f.updateValue(moduleID, optionName, valueOrFunction);

					RESUtils.setOption(moduleID, optionName, newValue);
				} catch (e) {
					console.error('Couldn\'t migrate (' + e + '; arguments were ' + Array.prototype.join.call(arguments, ', ') + ')');
				}
			},
			moveOption: function(oldModuleID, oldOptionName, newModuleID, newOptionName, valueOrFunction) {
				var oldValue = RESUtils.getOptions(oldModuleID)[oldOptionName].value;
				var newValue = RESOptionsMigrate.f.updateValue(oldValue, valueOrFunction);

				try {
					RESUtils.setOption(newModuleID, newOptionName, newValue);
				} catch (e) {
					console.error('Couldn\'t migrate (' + e + '; arguments were ' + Array.prototype.join.call(arguments, ', ') + ')');
				}
			},
			moveStorage: function(oldKey, newKey, valueOrFunction) {
				var oldValue = RESStorage.getItem(oldKey);
				var newValue = RESOptionsMigrate.f.updateValue(value, valueOrFunction);

				if (value !== null) {
					RESStorage.setItem(newKey, newValue);
				}
			},
			moveStorageToOption: function(oldKey, newModuleID, newOptionName, valueOrFunction) {
				var oldValue = RESStorage.getItem(oldKey);

				if (oldValue === null) {
					return;
				}

				var newValue = RESOptionsMigrate.f.updateValue(oldValue, valueOrFunction);

				try {
					RESUtils.setOption(newModuleID, newOptionName, newValue);
				} catch (e) {
					console.error('Couldn\'t migrate (' + e + '; arguments were ' + Array.prototype.join.call(arguments, ', ') + ')');
				}
			}
		},
		updateValue: function(oldValue, valueOrFunction) {
			var newValue;
			if (typeof valueOrFunction === "function") {
				newValue = valueOrFunction(oldValue);
			} else if (typeof valueOrFunction !== "undefined") {
				newValue = valueOrFunction;
			} else {
				newValue = oldValue;
			}

			return newValue;
		},
		specific: { // Specific migration function
			// Put your complicated function here to migrate data, then call this function in the switch.
			nightModeOn: function(value) {
				return value === 'dark';
			},
			subredditStylesWhitelist: function(value) {
				var parsedValue = safeJSON.parse(value);
				return parsedValue.join(',');
			},
			colorScoreComment: function(value) {
				return value ? 'automatic' : 'none';
			}
		}
	}
};
