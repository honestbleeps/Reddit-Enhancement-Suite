/* exported RESOptionsMigrate */

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

				try {
					var userTags = RESStorage.getItem('RESmodules.userTagger.tags'),
						updatedTags = {},
						toRemove;
					userTags = userTags ? safeJSON.parse(userTags, 'RESmodules.userTagger.tags', true) : null;
					if (userTags === null) {
						updatedTags = RESOptionsMigrate.migrators.specific.updateTagStorage();
						userTags = updatedTags.tags;
						toRemove = updatedTags.toRemove;
					}

					userTags = RESOptionsMigrate.migrators.specific.updateTagStorageCaseInsensitive(userTags);
					RESStorage.setItem('RESmodules.userTagger.tags', userTags);
					RESOptionsMigrate.migrators.specific.clearOldLocalStorage(toRemove);
				} catch (e) {
					console.error('Could not migrate user tags, please post this error to /r/RESissues', e);
				}
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

				var sticky = RESUtils.options.getOptions('notifications', true).sticky.value,
					fg = RESUtils.options.getOptions('keyboardNav', true).focusFGColorNight.value,
					bg = RESUtils.options.getOptions('keyboardNav', true).focusBGColorNight.value,
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
		},
		{
			versionNumber: '4.5.5',
			go: function() {
				var scrollTop = RESUtils.options.getOptions('keyboardNav', true).scrollTop;
				if (scrollTop && scrollTop.value) {
					RESOptionsMigrate.migrators.generic.updateOption('keyboardNav', 'scrollStyle', 'directional', 'top');
				}
				RESOptionsMigrate.migrators.generic.moveOption('betteReddit', 'uncheckSendRepliesToInbox', 'submitHelper', 'uncheckSendRepliesToInbox');
				RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'openBigEditor', 'commentPreview', 'openBigEditor');
				RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'autoSelectOnScroll', 'selectedEntry', 'autoSelectOnScroll');
				RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'clickFocus', 'selectedEntry', 'selectOnClick');
				RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'addFocusBGColor', 'selectedEntry', 'addFocusBGColor');
				RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'focusBGColor', 'selectedEntry', 'focusBGColor');
				RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'focusBGColorNight', 'selectedEntry', 'focusBGColorNight');
				RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'focusFGColorNight', 'selectedEntry', 'focusFGColorNight');
				RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'addFocusBorder', 'selectedEntry', 'addFocusBorder');
				RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'focusBorder', 'selectedEntry', 'focusBorder');
				RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'focusBorderNight', 'selectedEntry', 'focusBorderNight');

				RESOptionsMigrate.migrators.generic.forceUpdateOption('hover', 'fadeSpeed', RESOptionsMigrate.migrators.specific.updateFadeSpeed);
				RESOptionsMigrate.migrators.generic.forceUpdateOption('showParent', 'fadeSpeed', RESOptionsMigrate.migrators.specific.updateFadeSpeed);
				RESOptionsMigrate.migrators.generic.forceUpdateOption('subredditInfo', 'fadeSpeed', RESOptionsMigrate.migrators.specific.updateFadeSpeed);
				RESOptionsMigrate.migrators.generic.forceUpdateOption('userTagger', 'fadeSpeed', RESOptionsMigrate.migrators.specific.updateFadeSpeed);
				RESOptionsMigrate.migrators.generic.forceUpdateOption('commentTools', 'macros', RESOptionsMigrate.migrators.specific.commentToolsDefaultMacros);

				RESOptionsMigrate.migrators.generic.moveOption('betteReddit', 'showUnreadCount', 'orangered', 'showUnreadCount');
				RESOptionsMigrate.migrators.generic.moveOption('betteReddit', 'retroUnreadCount', 'orangered', 'retroUnreadCount');
				RESOptionsMigrate.migrators.generic.moveOption('betteReddit', 'showUnreadCountInFavicon', 'orangered', 'showUnreadCountInFavicon');
				RESOptionsMigrate.migrators.generic.moveOption('betteReddit', 'unreadLinksToInbox', 'orangered', 'unreadLinksToInbox');
				RESOptionsMigrate.migrators.generic.moveOption('betteReddit', 'hideModMail', 'orangered', 'hideModMail');

				RESOptionsMigrate.migrators.generic.moveOption('quickMessage', 'quickModeratorMessage', 'quickMessage', 'handleSideLinks');

				RESOptionsMigrate.migrators.generic.updateOption('showKarma', 'useCommas', false, true);

				RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'moveDown', 'keyboardNav', 'moveDownComment');
				RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'moveUp', 'keyboardNav', 'moveUpComment');

				RESOptionsMigrate.migrators.generic.moveOption('userTagger', 'hoverInfo', 'userInfo', 'hoverInfo');
				RESOptionsMigrate.migrators.generic.moveOption('userTagger', 'useQuickMessage', 'userInfo', 'useQuickMessage');
				RESOptionsMigrate.migrators.generic.moveOption('userTagger', 'hoverDelay', 'userInfo', 'hoverDelay');
				RESOptionsMigrate.migrators.generic.moveOption('userTagger', 'fadeDelay', 'userInfo', 'fadeDelay');
				RESOptionsMigrate.migrators.generic.moveOption('userTagger', 'fadeSpeed', 'userInfo', 'fadeSpeed');
				RESOptionsMigrate.migrators.generic.moveOption('userTagger', 'gildComments', 'userInfo', 'gildComments');
				RESOptionsMigrate.migrators.generic.moveOption('userTagger', 'highlightButton', 'userInfo', 'highlightButton');
				RESOptionsMigrate.migrators.generic.moveOption('userTagger', 'highlightColor', 'userInfo', 'highlightColor');
				RESOptionsMigrate.migrators.generic.moveOption('userTagger', 'highlightColorHover', 'userInfo', 'highlightColorHover');
				RESOptionsMigrate.migrators.generic.moveOption('userTagger', 'USDateFormat', 'userInfo', 'USDateFormat');

				RESOptionsMigrate.migrators.generic.forceUpdateOption('notifications', 'notificationTypes', RESOptionsMigrate.migrators.generic.selectDistinctRowsByColumnIndex.bind(this, [ 0, 1 /* moduleID, notificationID */ ] ));
				// Minify existing options
				for (var key in modules) {
					if ('options' in modules[key]) {
						RESUtils.options.saveModuleOptions(key, RESUtils.options.getOptions(key));
					}
				}
			}
		},
		{
			versionNumber: '4.6.1-stylesheets',
			go: function() {
				RESOptionsMigrate.migrators.generic.moveOption('stylesheet', 'loadSubredditStylesheets', 'stylesheet', 'loadStylesheets', RESOptionsMigrate.migrators.specific.subredditToUrl);
			}
		}
	],

	migrators: {
		generic: {
			updateOption: function(moduleID, optionName, formerDefaultValue, valueOrFunction) {
				try {
					var options = RESUtils.options.getOptions(moduleID, true),
						option = options[optionName],
						oldValue = option ? option.value : undefined,
						newValue = RESOptionsMigrate.updateValue(oldValue, valueOrFunction);

					// Only update this option to the new default value if its current value
					// hasn't been changed from the former default value.
					if (RESOptionsMigrate.optionMatchesFormerDefaultValue(option, formerDefaultValue)) {
						RESUtils.options.setOption(moduleID, optionName, newValue);
					}
				} catch (e) {
					console.error('Couldn\'t migrate (' + e + '; arguments were ' + Array.prototype.join.call(arguments, ', ') + ')', e.stack);
				}
			},
			forceUpdateOption: function(moduleID, optionName, valueOrFunction) {
				// ☢ ☠ ☣  DANGER, WILL ROBINSON, DANGER ☠ ☣ ☢
				// Make sure valueOrFunction doesn't destroy user settings!

				try {
					var options = RESUtils.options.getOptions(moduleID, true),
						option = options[optionName],
						oldValue = option ? option.value : undefined,
						newValue = RESOptionsMigrate.updateValue(oldValue, valueOrFunction);

					if (typeof newValue !== 'undefined') {
						RESUtils.options.setOption(moduleID, optionName, newValue);
					}
				} catch (e) {
					console.error('Couldn\'t migrate (' + e + '; arguments were ' + Array.prototype.join.call(arguments, ', ') + ')', e.stack);
				}
			},
			moveOption: function(oldModuleID, oldOptionName, newModuleID, newOptionName, valueOrFunction) {
				try {
					var options = RESUtils.options.getOptions(oldModuleID, true),
						option = options[oldOptionName],
						oldValue = option ? option.value : undefined,
						newValue = RESOptionsMigrate.updateValue(oldValue, valueOrFunction);

					if (typeof newValue !== 'undefined') {
						RESUtils.options.setOption(newModuleID, newOptionName, newValue);
					}
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
				if (typeof newValue !== 'undefined') {
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
					if (typeof newValue !== 'undefined') {
						RESUtils.options.setOption(newModuleID, newOptionName, newValue);
					}
				} catch (e) {
					console.error('Couldn\'t migrate (' + e + '; arguments were ' + Array.prototype.join.call(arguments, ', ') + ')');
				}
			},
			selectDistinctRowsByColumnIndex: function(distinctColumns, rows) {
				/**
					rows: array of arrays (e.g. RES table option)
					distinct (optional): array of numbers, indexes of columns for selecting distinct values

					SQL-ish: SELECT DISTINCT 0thColumn, 1stColumn FROM rows
				*/

				if (typeof rows === 'undefined') {
					rows = distinctColumns;
					distinctColumns = [ 0 ];
				} else {
					distinctColumns = [].concat(distinctColumns);
				}

				var index = {};
				var distinctRows = rows.filter(function(row) {
					var key = distinctColumns.map(function (columnIndex) {
						return row[columnIndex];
					}).join('!@#');

					if (index[key]) {
						// Already found a row with values for columns in distinct columns
						return false;
					} else {
						index[key] = row;
						return true;
					}
				});

				return distinctRows;
			},
			_test_selectDistinctRowsByColumnIndex: function() {
				/* jshint ignore:start */ // TODO: move to qunit file
				var	f = RESOptionsMigrate.migrators.generic.selectDistinctRowsByColumnIndex,
					distinct = [ 0, 1 ],
					rows = [
						[ 'for matching', 'values', 'keep the first row found' ],
						[ 'for matching', 'values', 'drop other rows' ],
						[ 'for non-matching', 'values', 'keep the only row found' ]
					],
					expected = [
						[ 'for matching', 'values', 'keep the first row found' ],
						[ 'for non-matching', 'values', 'keep the only row found' ]
					],
					actual = f(distinct, rows);
				console.log('Expected:', expected);
				console.log('Actual:', actual);
				debugger; // compare actual and expected
				/* jshint ignore:end */
			},
			splitRowsByListColumn: function(columnIndex, rows) {
				if (!rows) {
					return [];
				}
				return rows.map(function(row) {
					var splitColumnItems = row[columnIndex].split(',');
					var splitRows = splitColumnItems.map(function(columnItem) {
						var splitRow = row.slice();
						splitRow[columnIndex] = columnItem;
						return splitRow;
					});
					return splitRows;
				}).reduce(function(array, current) {
					return array.concat(current);
				}, []);
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
			},
			updateFadeSpeed: function(value) {
				if (value < 0 || value > 1) {
					return '0.7';
				} else {
					return (1 - value).toFixed(2);
				}
			},
			commentToolsDefaultMacros: function(value) {
				value = value || [];
				value = [
					['reddiquette', '[reddiquette](/wiki/reddiquette) '],
					['Promote RES', '[Reddit Enhancement Suite](http://redditenhancementsuite.com "also /r/Enhancement") '],
					['Current timestamp', '{{now}} ']
				].concat(value);
				return value;
			},
			updateTagStorage: function() {
				// update tag storage format from the old individual bits to a big JSON blob
				// It's OK that we're directly accessing localStorage here because if they have old school tag storage, it IS in localStorage.
				var ls = RESEnvironment.localStorage();
				if (!ls) return;
				var tags = {};
				var toRemove = [];
				for (var i = 0, len = ls.length; i < len; i++) {
					var keySplit = null;
					if (ls.key(i)) {
						keySplit = ls.key(i).split('.');
					}
					if (keySplit) {
						var keyRoot = keySplit[0];
						switch (keyRoot) {
							case 'reddituser':
								var thisNode = keySplit[1];
								if (typeof tags[keySplit[2]] === 'undefined') {
									tags[keySplit[2]] = {};
								}
								if (thisNode === 'votes') {
									tags[keySplit[2]].votes = ls.getItem(ls.key(i));
								} else if (thisNode === 'tag') {
									tags[keySplit[2]].tag = ls.getItem(ls.key(i));
								} else if (thisNode === 'color') {
									tags[keySplit[2]].color = ls.getItem(ls.key(i));
								} else if (thisNode === 'ignore') {
									tags[keySplit[2]].ignore = ls.getItem(ls.key(i));
								}
								// now delete the old stored garbage...
								var keyString = 'reddituser.' + thisNode + '.' + keySplit[2];
								toRemove.push(keyString);
								break;
							default:
								// console.log('Not currently handling keys with root: ' + keyRoot);
								break;
						}
					}
				}

				return {
					tags: tags,
					toRemove: toRemove
				};
			},
			subredditToUrl: function(rows) {
				rows = RESOptionsMigrate.migrators.generic.splitRowsByListColumn(0, rows);
				rows = rows.map(function(row) {
					if (row[0] === 'RESUpdates') {
						row[0] = modules['stylesheet'].updatesStylesheet;
					}
					return row;
				});
				return rows;
			},
			clearOldLocalStorage: function(keys) {
				if (!(keys && keys.length)) return;
				var localStorage = RESEnvironment.localStorage();
				if (!localStorage) return;
				for (var i = 0, len = keys.length; i < len; i++) {
					localStorage.removeItem(keys[i]);
				}
			},
			updateTagStorageCaseInsensitive: function(tags) {
				var destination, source, username, lower;
				var usernames = Object.keys(tags);

				for (var i = 0, length = usernames.length; i < length; i++) {
					username = usernames[i];
					lower = username.toLowerCase();
					if (lower === username) continue;

					destination = this.tags[lower] = this.tags[lower] || {};
					source = this.tags[username];

					if (source.votes) {
						destination.votes = (parseInt(destination.votes, 10) || 0) + (parseInt(source.votes, 10) || 0);
					}
					if (source.color && (!destination.color || destination.color === 'none')) {
						destination.color = source.color;
					}

					if (source.tag) {
						destination.tag = destination.tag ? destination.tag + ' | ' : '';
						destination.tag += source.tag;
					}

					if (source.ignore) {
						destination.ignore = source.ignore;
					}

					if (source.link) {
						if (destination.link) {
							destination.tag = destination.tag ? destination.tag + ' | ' : '';
							destination.tag += source.link;
						} else {
							destination.link = source.link;
						}
					}

					delete this.tags[username]; // safe because of "lower === username.toLowerCase" guard above
				}

				RESStorage.setItem('RESmodules.userTagger.tags', JSON.stringify(this.tags));
				RESStorage.setItem('RESmodules.userTagger.casefix', true);
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

			RESUtils.options.removeObsoleteOptions();
		}

		// Indicate that all the current migrations are satisfied for the next upgrade
		RESOptionsMigrate.setLastMigratedVersion(migrationVersions[migrationVersions.length - 1]);
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
		if (!option) {
			option = {
				type: 'legacy',
				value: undefined
			};
		}
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


if (typeof exports !== 'undefined') {
	exports.RESOptionsMigrate = RESOptionsMigrate;
}
