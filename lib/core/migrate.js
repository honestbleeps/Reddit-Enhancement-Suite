/*
Add new migrations to the end of RESOptionsMigrate.migrations in the
following form:

{
	versionNumber: '#.#.#',
	go: function() {
		// migration code
	}
}
*/

var RESOptionsMigrate = {
	migrations: [
		{
			versionNumber: '4.5.0.0',
			go: function() {
				RESOptionsMigrate.migrators.generic.moveOption('betteReddit', 'searchSubredditByDefault', 'searchHelper', 'searchSubredditByDefault');

				RESOptionsMigrate.migrators.generic.moveOption('styleTweaks', 'lightSwitch', 'nightMode', 'nightSwitch');
				RESOptionsMigrate.migrators.generic.moveOption('styleTweaks', 'lightOrDark', 'nightMode', 'nightModeOn',
					RESOptionsMigrate.migrators.specific.nightModeOn);
				RESOptionsMigrate.migrators.generic.moveOption('styleTweaks', 'useSubredditStyleInDarkMode', 'nightMode', 'useSubredditStyles');
				RESOptionsMigrate.migrators.generic.moveStorageToOption('RESmodules.styleTweaks.nightModeWhitelist',
					'nightMode', 'subredditStylesWhitelist',
					RESOptionsMigrate.migrators.specific.subredditStylesWhitelist);
			}
		},
		{
			versionNumber: '4.5.0.2',
			go: function() {
				RESOptionsMigrate.migrators.generic.updateOption('keyboardNav', 'imageMoveUp', [38, false, false, true, false], [38, false, true, false, false]);
				RESOptionsMigrate.migrators.generic.updateOption('keyboardNav', 'imageMoveDown', [40, false, false, true, false], [40, false, true, false, false]);
				RESOptionsMigrate.migrators.generic.updateOption('keyboardNav', 'imageMoveLeft', [37, false, false, true, false], [37, false, true, false, false]);
				RESOptionsMigrate.migrators.generic.updateOption('keyboardNav', 'imageMoveRight', [39, false, false, true, false], [39, false, true, false, false]);
			}
		},
		{
			versionNumber: '4.5.0.3',
			go: function() {
				// Token migration for the benefit of developers or people running bleeding-edge
			}
		},
		{
			versionNumber: '4.5.1',
			go: function() {
				RESOptionsMigrate.migrators.generic.forceUpdateOption('voteEnhancements', 'colorCommentScore', RESOptionsMigrate.migrators.specific.colorCommentScore);

				var sticky = RESUtils.getOptions('notifications').sticky.value,
					fg = RESUtils.getOptions('keyboardNav').focusFGColorNight.value,
					bg = RESUtils.getOptions('keyboardNav').focusBGColorNight.value,
					test = document.createElement('div'),
					fgCalculated, bgCalculated;

				// perNotification may have only been present in dev releases, but check for it and update as it's
				// no longer a valid option.
				if (sticky === 'perNotification') {
					RESOptionsMigrate.migrators.generic.forceUpdateOption('notifications', 'sticky', 'notificationType');
				}

				// If night mode focus foreground color === night mode focus background color,
				// force them back to new defaults.
				//
				// Since it may be rgba or hex and we're not sure, let's do something clever to
				// make sure we can compare the colors.
				test.style.color = fg;
				test.style.backgroundColor = bg;
				fgCalculated = test.style.color;
				bgCalculated = test.style.backgroundColor;
				if ((fg === bg) || (fgCalculated === bgCalculated)) {
					RESOptionsMigrate.migrators.generic.forceUpdateOption('keyboardNav', 'focusBGColorNight', '#373737');
					RESOptionsMigrate.migrators.generic.forceUpdateOption('keyboardNav', 'focusFGColorNight', '#DDDDDD');
				}

				// Show all options for all users
				RESOptionsMigrate.migrators.generic.moveOption('settingsNavigation', 'showAdvancedOptions', 'settingsNavigation', 'showAllOptions',
					true);
				RESOptionsMigrate.migrators.generic.moveOption('settingsNavigation', 'showAdvancedOptionsAlert', 'settingsNavigation', 'showAllOptionsAlert');
			}
		},
		{
			versionNumber: '4.5.3',
			go: function() {
				RESOptionsMigrate.migrators.generic.updateOption('searchHelper', 'addSubmitButton', true, false);
				RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'save', 'keyboardNav', 'savePost');
				RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'save', 'keyboardNav', 'saveRES');
			}
		},
		{
			versionNumber: '4.5.4',
			go: function() {
				RESOptionsMigrate.migrators.generic.forceUpdateOption('filteReddit', 'keywords', RESOptionsMigrate.migrators.specific.removeUndefinedUnlessKeyword);
				RESOptionsMigrate.migrators.generic.updateOption('quickMessage', 'quickModeratorMessage', false, true);
			}
		}
	],

	migrators: {
		generic: {
			updateOption: function(moduleID, optionName, formerDefaultValue, valueOrFunction) {
				try {
					var option = RESUtils.getOptions(moduleID)[optionName],
						oldValue = option.value,
						newValue = RESOptionsMigrate.updateValue(oldValue, valueOrFunction);

					// Only update this option to the new default value if its current value
					// hasn't been changed from the former default value.
					if (RESOptionsMigrate.optionMatchesFormerDefaultValue(option, formerDefaultValue)) {
						RESUtils.setOption(moduleID, optionName, newValue);
					}
				} catch (e) {
					console.error('Couldn\'t migrate (' + e + '; arguments were ' + Array.prototype.join.call(arguments, ', ') + ')', e.stack);
				}
			},
			forceUpdateOption: function(moduleID, optionName, valueOrFunction) {
				// ☢ ☠ ☣  DANGER, WILL ROBINSON, DANGER ☠ ☣ ☢
				// Make sure valueOrFunction doesn't destroy user settings!

				try {
					var option = RESUtils.getOptions(moduleID)[optionName],
						oldValue = option.value,
						newValue = RESOptionsMigrate.updateValue(oldValue, valueOrFunction);

					RESUtils.setOption(moduleID, optionName, newValue);
				} catch (e) {
					console.error('Couldn\'t migrate (' + e + '; arguments were ' + Array.prototype.join.call(arguments, ', ') + ')', e.stack);
				}
			},
			moveOption: function(oldModuleID, oldOptionName, newModuleID, newOptionName, valueOrFunction) {
				try {
					var oldValue = RESUtils.getOptions(oldModuleID)[oldOptionName].value,
						newValue = RESOptionsMigrate.updateValue(oldValue, valueOrFunction);

					RESUtils.setOption(newModuleID, newOptionName, newValue);
				} catch (e) {
					console.error('Couldn\'t migrate (' + e + '; arguments were ' + Array.prototype.join.call(arguments, ', ') + ')', e.stack);
				}
			},
			moveStorage: function(oldKey, newKey, valueOrFunction) {
				var oldValue = RESStorage.getItem(oldKey);

				if (oldValue === null) {
					return;
				}

				var newValue = RESOptionsMigrate.updateValue(oldValue, valueOrFunction);
				RESStorage.setItem(newKey, newValue);
			},
			moveStorageToOption: function(oldKey, newModuleID, newOptionName, valueOrFunction) {
				var oldValue = RESStorage.getItem(oldKey);

				if (oldValue === null) {
					return;
				}

				var newValue = RESOptionsMigrate.updateValue(oldValue, valueOrFunction);

				try {
					RESUtils.setOption(newModuleID, newOptionName, newValue);
				} catch (e) {
					console.error('Couldn\'t migrate (' + e + '; arguments were ' + Array.prototype.join.call(arguments, ', ') + ')');
				}
			}
		},
		specific: {
			nightModeOn: function(value) {
				return value === 'dark';
			},
			subredditStylesWhitelist: function(value) {
				var parsedValue = safeJSON.parse(value);
				return parsedValue.join(',');
			},
			colorCommentScore: function(value) {
				// v4.5.0.2 (fresh installs) onwards have the correct default value
				if (typeof value === 'string') {
					return value;
				}

				// Notification about 4.5.0.1 upgrade issue (ref: 49b4cf2c08659c218eed5f3a82dd81f9797ac984)
				if (!value) {
					RESOptionsMigrate.showNotification('voteEnhancements', 'colorCommentScore',
						'The Vote Enhancements colorCommentScore feature has been turned off.');
				}

				// 4.5.0.1 migration
				return value ? 'automatic' : 'none';
			},
			removeUndefinedUnlessKeyword: function(values) {
				for (var i = 0, length = values.length; i < length; i++) {

					if (values[i] && values[i][3] === 'undefined') {
						values[i][3] = '';
					}
				}

				return values;
			}
		}
	},

	showNotification: function(moduleID, optionName, message) {
		message = RESUtils.firstValid(message, '') +
			'<br><br>You can change this option ' +
			modules['settingsNavigation'].makeUrlHashLink('voteEnhancements', 'colorCommentScore', 'in the RES settings console.');

		modules['notifications'].showNotification({
			moduleID: 'troubleshooter',
			notificationID: 'migration',
			sticky: true,
			header: 'Options Updated',
			message: message
		});
	},

	migrate: function() {
		var startMigrationAt = RESOptionsMigrate.getMigrationStartIndex(),
			migrationVersions = RESOptionsMigrate.getVersionNumbers();

		if (typeof startMigrationAt !== 'undefined') {
			for (var i = startMigrationAt, length = migrationVersions.length; i < length; i++) {
				var currentMigration = RESOptionsMigrate.migrations[i];
				currentMigration.go();

				// Checkpoint, in case the next migration crashes
				RESOptionsMigrate.setLastMigratedVersion(currentMigration.versionNumber);
			}
		}

		// Indicate that all the current migrations are satisfied for the next upgrade
		RESOptionsMigrate.setLastMigratedVersion(migrationVersions[migrationVersions.length - 1].versionNumber);
	},

	getMigrationStartIndex: function() {
		var lastMigratedVersion = RESOptionsMigrate.getLastMigratedVersion();

		if (lastMigratedVersion !== false) {
			var startIndex = 0;

			if (typeof lastMigratedVersion === 'string') {
				// Already ran migrations up to and including lastMigratedVersion
				// Start at the migration directly following
				var migrationVersions = RESOptionsMigrate.getVersionNumbers();
				startIndex = migrationVersions.indexOf(lastMigratedVersion) + 1;
			}

			return startIndex;
		}
	},

	// Returns a string like "4.5.0.1" (the last migration run),
	// null (no migrations run yet), or false (do not run migrations)
	getLastMigratedVersion: function() {
		var RESOptionsVersion = RESStorage.getItem('RESOptionsVersion');

		if (typeof RESOptionsVersion === 'undefined') {
			// Error occured sometime in the past, abort
			console.warn('RESOptionsVersion was undefined');
		} else if (RESOptionsVersion !== null) {
			// Migration has run before; verify/sanitize the version number
			if (/^\d$/.test(RESOptionsVersion)) {
				// Legacy format: integer number
				var legacyOptionVersionMapping = ['4.5.0.0', '4.5.0.1'];
				RESOptionsVersion = legacyOptionVersionMapping[RESOptionsVersion - 1];
			} else if (RESOptionsMigrate.getVersionNumbers().indexOf(RESOptionsVersion) === -1) {
				// Abort, abort! Probably downgraded
				console.warn('Couldn\'t find a migration matching RESOptionsVersion = ' + RESOptionsVersion);
				RESOptionsVersion = false;
			} else {
				// RESOptionsVersion is a valid migration version number
			}
		} else if (RESStorage.getItem('RES.firstRun.4.5.0.2')) {
			// 4.5.0.2 bug: RESOptionsVersion was not set on fresh installs.
			RESOptionsVersion = '4.5.0.2';
		} else if (RESStorage.getItem('RES.firstRun.4.3.2.1') || RESStorage.getItem('RES.firstRun.4.3.1.2') || RESStorage.getItem('RES.firstRun.4.3.0.3') || RESStorage.getItem('RES.firstRun.4.2.0.2') || RESStorage.getItem('RES.firstRun.4.1.5')) {
			// Upgraded from old version to a version which supports migrations; run all migrations
			RESOptionsVersion = null;
		} else {
			// New install, no migrations necessary
			RESOptionsVersion = false;
		}

		return RESOptionsVersion;
	},
	setLastMigratedVersion: function(value) {
		if (value) {
			RESStorage.setItem('RESOptionsVersion', value);
		}
	},

	getVersionNumbers: function() {
		return RESOptionsMigrate.migrations.map(function(migration) { return migration.versionNumber; });
	},

	// This function compares a given option value to its "former default" -- the default
	// before an attempted migration. Options aren't always a string, so equivalency won't
	// work. Note that "option" needs to be the actual option object, NOT option.value.
	//
	// NOTE: This function may need to be updated for things like objects, etc. Currently
	// it'll only work on string / array.
	optionMatchesFormerDefaultValue: function(option, formerDefaultValue) {
		var oldValue = option.value;

		// keyCodes once customized also save metaKey in a 5th index, but we used
		// to not store the metakey, so they have a length of 4 by default. In order
		// to do a proper array comparison, we need the lengths to match, so if a
		// 5th element is not present, push false into the array.
		if ((option.type === 'keycode') && (option.value.length === 4)) {
			oldValue.push(false);
		}

		// Check if the oldValue differs from the former default value. If it doesn't,
		// then the user set something custom and we should honor that.
		//
		// If it's an array, it's not as simple as just variable comparison.
		if (Array.isArray(formerDefaultValue)) {
			// Compare arrays; if they're not the same, abort since the arrays aren't equal.
			if (formerDefaultValue.length !== oldValue.length) {
				return false;
			}
			for (var i = 0, len = formerDefaultValue.length; i < len; i++) {
				if (formerDefaultValue[i] !== oldValue[i]) {
					return false;
				}
			}
		} else if (formerDefaultValue !== oldValue) {
			// Skip migration; the user set custom settings that aren't the default.
			return false;
		}

		return true;
	},

	updateValue: function(oldValue, valueOrFunction) {
		var newValue;
		if (typeof valueOrFunction === 'function') {
			newValue = valueOrFunction(oldValue);
		} else if (typeof valueOrFunction !== 'undefined') {
			newValue = valueOrFunction;
		} else {
			newValue = oldValue;
		}

		return newValue;
	}
};
