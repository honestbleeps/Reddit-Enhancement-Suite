// Add new migrations to the end of RESOptionsMigrate.migrations in the form  '#.#.#.#': function() { migration code }

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
			versionNumber: '4.5.0.1',
			go: function() {
				RESOptionsMigrate.migrators.generic.updateOption('voteEnhancements', 'colorCommentScore', RESOptionsMigrate.migrators.specific.colorCommentScore);
			}
		},
		{
			versionNumber: '4.5.0.2',
			go: function() {
				RESOptionsMigrate.migrators.generic.updateOption('keyboardNav', 'imageMoveUp', [38, false, true, false]);
				RESOptionsMigrate.migrators.generic.updateOption('keyboardNav', 'imageMoveDown', [40, false, true, false]);
				RESOptionsMigrate.migrators.generic.updateOption('keyboardNav', 'imageMoveLeft', [37, false, true, false]);
				RESOptionsMigrate.migrators.generic.updateOption('keyboardNav', 'imageMoveRight', [39, false, true, false]);
			}
		}
	],

	migrators: {
		generic: {
			updateOption: function(moduleID, optionName, valueOrFunction) {
				try {
					var oldValue = RESUtils.getOptions(moduleID)[optionName].value;
					var newValue = RESOptionsMigrate.updateValue(oldValue, valueOrFunction);

					RESUtils.setOption(moduleID, optionName, newValue);
				} catch (e) {
					console.error('Couldn\'t migrate (' + e + '; arguments were ' + Array.prototype.join.call(arguments, ', ') + ')');
				}
			},
			moveOption: function(oldModuleID, oldOptionName, newModuleID, newOptionName, valueOrFunction) {
				try {
					var oldValue = RESUtils.getOptions(oldModuleID)[oldOptionName].value;
					var newValue = RESOptionsMigrate.migrators.updateValue(oldValue, valueOrFunction);

					RESUtils.setOption(newModuleID, newOptionName, newValue);
				} catch (e) {
					console.error('Couldn\'t migrate (' + e + '; arguments were ' + Array.prototype.join.call(arguments, ', ') + ')');
				}
			},
			moveStorage: function(oldKey, newKey, valueOrFunction) {
				var oldValue = RESStorage.getItem(oldKey);
				var newValue = RESOptionsMigrate.updateValue(oldValue, valueOrFunction);

				if (value !== null) {
					RESStorage.setItem(newKey, newValue);
				}
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
				return value ? 'automatic' : 'none';
			}
		}
	},

	migrate: function() {
		var startMigrationAt = RESOptionsMigrate.getMigrationStartIndex();
		if (typeof startMigrationAt !== "undefined") {
			var migrationVersions = RESOptionsMigrate.getVersionNumbers();
			for (var i = startMigrationAt, length = migrationVersions.length; i < length; i++) {
				var currentMigration = RESOptionsMigrate.migrations[i];
				currentMigration.go();
				RESOptionsMigrate.setLastMigratedVersion(currentMigration.versionNumber);
			}
		}
	},

	getMigrationStartIndex: function() {
		var lastMigratedVersion = RESOptionsMigrate.getLastMigratedVersion();
		if (lastMigratedVersion !== false) {

			var startIndex = 0;

			if (typeof lastMigratedVersion === "string") {
				// Already ran migrations up to and including lastMigratedVersion
				// Start at the migration directly following
				var migrationVersions = RESOptionsMigrate.getVersionNumbers();
				startIndex = migrationVersions.indexOf(lastMigratedVersion) + 1;
			}

			return startIndex;
		}
	},
	getLastMigratedVersion: function() {
		// Returns a string like "4.5.0.1" (the last migration run), null (no migrations run yet), or false (do not run migratoins)

		var RESOptionsVersion = RESStorage.getItem('RESOptionsVersion');

		if (RESOptionsVersion !== null) {
			// Migration has run before; verify/sanitize the version number

			if (/^\d$/.test(RESOptionsVersion)) {
				// Legacy format: integer number
				var legacyOptionVersionMapping = ["4.5.0.0", "4.5.0.1"];
				RESOptionsVersion = legacyOptionVersionMapping[RESOptionsVersion - 1];
			} else if (RESOptionsMigrate.getVersionNumbers().indexOf(RESOptionsVersion) === -1) {
				// abort, abort!  probably downgraded
				console.warn("Couldn't find a migration matching RESOptionsVersion = " + RESOptionsVersion);
				RESOptionsVersion = false;
			} else {
				// RESOptionsVersion is a valid migration version number
			}
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
		RESStorage.setItem("RESOptionsVersion", value);
	},

	getVersionNumbers: function() {
		return this.migrations.map(function(migration) { return migration.versionNumber; });
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
	}
};
