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
		var RESOptionsVersion = RESStorage.getItem('RESOptionsVersion'),
			hasMigrateRun = (RESOptionsVersion !== null);

		if (!hasMigrateRun) {
			// Assume that users have v4.3.2.1 before upgrading to a later version
			var newInstall = !RESStorage.getItem('RES.firstRun.4.3.2.1');

			RESOptionsVersion = newInstall ? -1 : 0;
		}

		switch (RESOptionsVersion) {
			case -1: // It's the first time we install RES, there is nothing to migrate
				break;

			case 0: // Before migrate.js was implemented (i.e. before v4.5.0.0)
				RESOptionsMigrate.f.generic.move('betteReddit', 'searchSubredditByDefault', 'searchHelper', 'searchSubredditByDefault');

				RESOptionsMigrate.f.generic.move('styleTweaks', 'lightSwitch', 'nightMode', 'nightSwitch');
				RESOptionsMigrate.f.generic.move('styleTweaks', 'lightOrDark', 'nightMode', 'nightModeOn',
					RESOptionsMigrate.f.specific.nightModeOn);
				RESOptionsMigrate.f.generic.move('styleTweaks', 'useSubredditStyleInDarkMode', 'nightMode', 'useSubredditStyles');
				RESOptionsMigrate.f.generic.moveStorageToOption('RESmodules.styleTweaks.nightModeWhitelist',
					'nightMode', 'subredditStylesWhitelist',
					RESOptionsMigrate.f.specific.subredditStylesWhitelist);

			case 1: // v4.5.1
				RESOptionsMigrate.f.generic.update('voteEnhancements', 'colorCommentScore', RESOptionsMigrate.f.specific.colorScoreComment);

			case 2:

			case 3:

			case 4:

			default:
				RESStorage.setItem('RESOptionsVersion', this.lastVersion);
			break;
		}
	},
	f: { // Migration functions
		generic: { // Generic migration function
			update: function(moduleID, optionName, f) {
				try {
					RESUtils.setOption(moduleID, optionName, f(RESUtils.getOptions(moduleID)[optionName].value));
				} catch (e) {
					console.error('Couldn\'t migrate (' + e + '; arguments were ' + Array.prototype.join.call(arguments, ', ') + ')');
				}
			},
			move: function(oldModuleID, oldOptionName, newModuleID, newOptionName, f) {
				// Replace f with a dummy function if not passed in
				f = f || function(v) { return v; };

				try {
					RESUtils.setOption(newModuleID, newOptionName, f(RESUtils.getOptions(oldModuleID)[oldOptionName].value));
				} catch (e) {
					console.error('Couldn\'t migrate (' + e + '; arguments were ' + Array.prototype.join.call(arguments, ', ') + ')');
				}
			},
			moveStorage: function(oldKey, newKey, f) {
				// Replace f with a dummy function if not passed in
				f = f || function(v) { return v; };

				var value = RESStorage.getItem(oldKey);

				if (value !== null) {
					RESStorage.setItem(newKey, f(value));
				}
			},
			moveStorageToOption: function(oldKey, newModuleID, newOptionName, f) {
				// Replace f with a dummy function if not passed in
				f = f || function(v) { return v; };

				var value = RESStorage.getItem(oldKey);

				if (value === null) {
					return;
				}

				var parsedValue = f(safeJSON.parse(value));

				try {
					RESUtils.setOption(newModuleID, newOptionName, parsedValue);
				} catch (e) {
					console.error('Couldn\'t migrate (' + e + '; arguments were ' + Array.prototype.join.call(arguments, ', ') + ')');
				}
			}
		},
		specific: { // Specific migration function
			// Put your complicated function here to migrate data, then call this function in the switch.
			nightModeOn: function(value) {
				return value === 'dark';
			},
			subredditStylesWhitelist: function(value) {
				return value.join(',');
			},
			colorScoreComment: function(value) {
				return value ? 'automatic' : 'none';
			}
		}
	}
};
