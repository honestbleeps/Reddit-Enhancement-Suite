var RESOptionsMigrate = {
	lastVersion: 1,
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
		var RESOptionsVersion = RESStorage.getItem('RESOptionsVersion');
		switch (RESOptionsVersion) {
			case null: // Before migrate.js was implemented (i.e. before v4.4.0)
				RESOptionsMigrate.f.generic.move('betteReddit', 'searchSubredditByDefault', 'searchHelper', 'searchSubredditByDefault');

				RESOptionsMigrate.f.generic.move('styleTweaks', 'lightSwitch', 'nightMode', 'nightSwitch');
				RESOptionsMigrate.f.generic.move('styleTweaks', 'lightOrDark', 'nightMode', 'nightModeOn',
					RESOptionsMigrate.f.specific.nightModeOn);
				RESOptionsMigrate.f.generic.move('styleTweaks', 'useSubredditStyleInDarkMode', 'nightMode', 'useSubredditStyles');
				RESOptionsMigrate.f.generic.moveStorageToOption('RESmodules.styleTweaks.nightModeWhitelist',
					'nightMode', 'subredditStylesWhitelist',
					RESOptionsMigrate.f.specific.subredditStylesWhitelist);

			case 1:

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
			move: function(oldModuleID, oldOptionName, newModuleID, newOptionName, f) {
				// Replace f with a dummy function if not passed in
				f = f || function() {};

				try {
					RESUtils.setOption(newModuleID, newOptionName, f(RESUtils.getOptions(oldModuleID)[oldOptionName].value));
				} catch (e) {
					console.error('Couldn\'t migrate (' + e + '; arguments were ' + Array.prototype.join.call(arguments, ', ') + ')');
				}
			},
			moveStorage: function(oldKey, newKey, f) {
				// Replace f with a dummy function if not passed in
				f = f || function() {};

				var value = RESStorage.getItem(oldKey);

				if (value !== null) {
					RESStorage.setItem(newKey, f(value));
				}
			},
			moveStorageToOption: function(oldKey, newModuleID, newOptionName, f) {
				// Replace f with a dummy function if not passed in
				f = f || function() {};

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
			}
		}
	}
};
