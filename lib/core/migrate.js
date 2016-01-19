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
			async go() {
				await RESOptionsMigrate.migrators.generic.moveOption('betteReddit', 'searchSubredditByDefault', 'searchHelper', 'searchSubredditByDefault');

				await RESOptionsMigrate.migrators.generic.moveOption('styleTweaks', 'lightSwitch', 'nightMode', 'nightSwitch');
				await RESOptionsMigrate.migrators.generic.moveOption('styleTweaks', 'lightOrDark', 'nightMode', 'nightModeOn',
					RESOptionsMigrate.migrators.specific.nightModeOn);
				await RESOptionsMigrate.migrators.generic.moveOption('styleTweaks', 'useSubredditStyleInDarkMode', 'nightMode', 'useSubredditStyles');
				await RESOptionsMigrate.migrators.generic.moveStorageToOption('RESmodules.styleTweaks.nightModeWhitelist',
					'nightMode', 'subredditStylesWhitelist',
					RESOptionsMigrate.migrators.specific.subredditStylesWhitelist);

				try {
					var userTags = await RESEnvironment.storage.getRaw('RESmodules.userTagger.tags'),
						updatedTags = {},
						toRemove;
					userTags = userTags ? safeJSON.parse(userTags, 'RESmodules.userTagger.tags', true) : null;
					if (userTags === null) {
						updatedTags = RESOptionsMigrate.migrators.specific.updateTagStorage();
						userTags = updatedTags.tags;
						toRemove = updatedTags.toRemove;
					}

					userTags = RESOptionsMigrate.migrators.specific.updateTagStorageCaseInsensitive(userTags);
					RESEnvironment.storage.setRaw('RESmodules.userTagger.tags', userTags);
					RESOptionsMigrate.migrators.specific.clearOldLocalStorage(toRemove);
				} catch (e) {
					console.error('Could not migrate user tags, please post this error to /r/RESissues', e);
				}
			}
		}, {
			versionNumber: '4.5.0.2',
			async go() {
				await RESOptionsMigrate.migrators.generic.updateOption('keyboardNav', 'imageMoveUp', [38, false, false, true, false], [38, false, true, false, false]);
				await RESOptionsMigrate.migrators.generic.updateOption('keyboardNav', 'imageMoveDown', [40, false, false, true, false], [40, false, true, false, false]);
				await RESOptionsMigrate.migrators.generic.updateOption('keyboardNav', 'imageMoveLeft', [37, false, false, true, false], [37, false, true, false, false]);
				await RESOptionsMigrate.migrators.generic.updateOption('keyboardNav', 'imageMoveRight', [39, false, false, true, false], [39, false, true, false, false]);
			}
		}, {
			versionNumber: '4.5.0.3',
			go: function() {
				// Token migration for the benefit of developers or people running bleeding-edge
			}
		}, {
			versionNumber: '4.5.1',
			async go() {
				await RESOptionsMigrate.migrators.generic.forceUpdateOption('voteEnhancements', 'colorCommentScore', RESOptionsMigrate.migrators.specific.colorCommentScore);

				const sticky = (await RESUtils.options.getOptions('notifications', true)).sticky.value,
					fg = (await RESUtils.options.getOptions('keyboardNav', true)).focusFGColorNight.value,
					bg = (await RESUtils.options.getOptions('keyboardNav', true)).focusBGColorNight.value,
					test = document.createElement('div');

				// perNotification may have only been present in dev releases, but check for it and update as it's
				// no longer a valid option.
				if (sticky === 'perNotification') {
					await RESOptionsMigrate.migrators.generic.forceUpdateOption('notifications', 'sticky', 'notificationType');
				}

				// If night mode focus foreground color === night mode focus background color,
				// force them back to new defaults.
				//
				// Since it may be rgba or hex and we're not sure, let's do something clever to
				// make sure we can compare the colors.
				test.style.color = fg;
				test.style.backgroundColor = bg;
				const fgCalculated = test.style.color;
				const bgCalculated = test.style.backgroundColor;
				if ((fg === bg) || (fgCalculated === bgCalculated)) {
					await RESOptionsMigrate.migrators.generic.forceUpdateOption('keyboardNav', 'focusBGColorNight', '#373737');
					await RESOptionsMigrate.migrators.generic.forceUpdateOption('keyboardNav', 'focusFGColorNight', '#DDDDDD');
				}

				// Show all options for all users
				await RESOptionsMigrate.migrators.generic.moveOption('settingsNavigation', 'showAdvancedOptions', 'settingsNavigation', 'showAllOptions',
					true);
				await RESOptionsMigrate.migrators.generic.moveOption('settingsNavigation', 'showAdvancedOptionsAlert', 'settingsNavigation', 'showAllOptionsAlert');
			}
		}, {
			versionNumber: '4.5.3',
			async go() {
				await RESOptionsMigrate.migrators.generic.updateOption('searchHelper', 'addSubmitButton', true, false);
				await RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'save', 'keyboardNav', 'savePost');
				await RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'save', 'keyboardNav', 'saveRES');
			}
		}, {
			versionNumber: '4.5.4',
			async go() {
				await RESOptionsMigrate.migrators.generic.forceUpdateOption('filteReddit', 'keywords', RESOptionsMigrate.migrators.specific.removeUndefinedUnlessKeyword);
				await RESOptionsMigrate.migrators.generic.updateOption('quickMessage', 'quickModeratorMessage', false, true);
			}
		}, {
			versionNumber: '4.5.5',
			async go() {
				var scrollTop = (await RESUtils.options.getOptions('keyboardNav', true)).scrollTop;
				if (scrollTop && scrollTop.value) {
					await RESOptionsMigrate.migrators.generic.updateOption('keyboardNav', 'scrollStyle', 'directional', 'top');
				}
				await RESOptionsMigrate.migrators.generic.moveOption('betteReddit', 'uncheckSendRepliesToInbox', 'submitHelper', 'uncheckSendRepliesToInbox');
				await RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'openBigEditor', 'commentPreview', 'openBigEditor');
				await RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'autoSelectOnScroll', 'selectedEntry', 'autoSelectOnScroll');
				await RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'clickFocus', 'selectedEntry', 'selectOnClick');
				await RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'addFocusBGColor', 'selectedEntry', 'addFocusBGColor');
				await RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'focusBGColor', 'selectedEntry', 'focusBGColor');
				await RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'focusBGColorNight', 'selectedEntry', 'focusBGColorNight');
				await RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'focusFGColorNight', 'selectedEntry', 'focusFGColorNight');
				await RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'addFocusBorder', 'selectedEntry', 'addFocusBorder');
				await RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'focusBorder', 'selectedEntry', 'focusBorder');
				await RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'focusBorderNight', 'selectedEntry', 'focusBorderNight');

				await RESOptionsMigrate.migrators.generic.forceUpdateOption('hover', 'fadeSpeed', RESOptionsMigrate.migrators.specific.updateFadeSpeed);
				await RESOptionsMigrate.migrators.generic.forceUpdateOption('showParent', 'fadeSpeed', RESOptionsMigrate.migrators.specific.updateFadeSpeed);
				await RESOptionsMigrate.migrators.generic.forceUpdateOption('subredditInfo', 'fadeSpeed', RESOptionsMigrate.migrators.specific.updateFadeSpeed);
				await RESOptionsMigrate.migrators.generic.forceUpdateOption('userTagger', 'fadeSpeed', RESOptionsMigrate.migrators.specific.updateFadeSpeed);
				await RESOptionsMigrate.migrators.generic.forceUpdateOption('commentTools', 'macros', RESOptionsMigrate.migrators.specific.commentToolsDefaultMacros);

				await RESOptionsMigrate.migrators.generic.moveOption('betteReddit', 'showUnreadCount', 'orangered', 'showUnreadCount');
				await RESOptionsMigrate.migrators.generic.moveOption('betteReddit', 'retroUnreadCount', 'orangered', 'retroUnreadCount');
				await RESOptionsMigrate.migrators.generic.moveOption('betteReddit', 'showUnreadCountInFavicon', 'orangered', 'showUnreadCountInFavicon');
				await RESOptionsMigrate.migrators.generic.moveOption('betteReddit', 'unreadLinksToInbox', 'orangered', 'unreadLinksToInbox');
				await RESOptionsMigrate.migrators.generic.moveOption('betteReddit', 'hideModMail', 'orangered', 'hideModMail');

				await RESOptionsMigrate.migrators.generic.moveOption('quickMessage', 'quickModeratorMessage', 'quickMessage', 'handleSideLinks');

				await RESOptionsMigrate.migrators.generic.updateOption('showKarma', 'useCommas', false, true);

				await RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'moveDown', 'keyboardNav', 'moveDownComment');
				await RESOptionsMigrate.migrators.generic.moveOption('keyboardNav', 'moveUp', 'keyboardNav', 'moveUpComment');

				await RESOptionsMigrate.migrators.generic.moveOption('userTagger', 'hoverInfo', 'userInfo', 'hoverInfo');
				await RESOptionsMigrate.migrators.generic.moveOption('userTagger', 'useQuickMessage', 'userInfo', 'useQuickMessage');
				await RESOptionsMigrate.migrators.generic.moveOption('userTagger', 'hoverDelay', 'userInfo', 'hoverDelay');
				await RESOptionsMigrate.migrators.generic.moveOption('userTagger', 'fadeDelay', 'userInfo', 'fadeDelay');
				await RESOptionsMigrate.migrators.generic.moveOption('userTagger', 'fadeSpeed', 'userInfo', 'fadeSpeed');
				await RESOptionsMigrate.migrators.generic.moveOption('userTagger', 'gildComments', 'userInfo', 'gildComments');
				await RESOptionsMigrate.migrators.generic.moveOption('userTagger', 'highlightButton', 'userInfo', 'highlightButton');
				await RESOptionsMigrate.migrators.generic.moveOption('userTagger', 'highlightColor', 'userInfo', 'highlightColor');
				await RESOptionsMigrate.migrators.generic.moveOption('userTagger', 'highlightColorHover', 'userInfo', 'highlightColorHover');
				await RESOptionsMigrate.migrators.generic.moveOption('userTagger', 'USDateFormat', 'userInfo', 'USDateFormat');

				await RESOptionsMigrate.migrators.generic.forceUpdateOption('notifications', 'notificationTypes', RESOptionsMigrate.migrators.generic.selectDistinctRowsByColumnIndex.bind(this, [ 0, 1 /* moduleID, notificationID */ ] ));
				// Minify existing options
				await Promise.all(Object.keys(modules).map(async key => {
					if ('options' in modules[key]) {
						RESUtils.options.saveModuleOptions(key, await RESUtils.options.getOptions(key));
					}
				}));
			}
		}, {
			versionNumber: '4.7.0',
			async go() {
				await RESOptionsMigrate.migrators.generic.forceUpdateOption('orangered', 'showUnreadCount', value => value === false);
				await RESOptionsMigrate.migrators.generic.moveOption('orangered', 'showUnreadCount', 'orangered', 'hideUnreadCount');
			}
		}
	],

	migrators: {
		generic: {
			async updateOption(moduleID, optionName, formerDefaultValue, valueOrFunction) {
				try {
					const options = await RESUtils.options.getOptions(moduleID, true),
						option = options[optionName],
						oldValue = option ? option.value : undefined,
						newValue = RESOptionsMigrate.updateValue(oldValue, valueOrFunction);

					// Only update this option to the new default value if its current value
					// hasn't been changed from the former default value.
					if (RESOptionsMigrate.optionMatchesFormerDefaultValue(option, formerDefaultValue)) {
						await RESUtils.options.setOption(moduleID, optionName, newValue);
					}
				} catch (e) {
					console.error('Couldn\'t migrate (' + e + '; arguments were ' + Array.prototype.join.call(arguments, ', ') + ')', e.stack);
				}
			},
			async forceUpdateOption(moduleID, optionName, valueOrFunction) {
				// ☢ ☠ ☣  DANGER, WILL ROBINSON, DANGER ☠ ☣ ☢
				// Make sure valueOrFunction doesn't destroy user settings!

				try {
					const options = await RESUtils.options.getOptions(moduleID, true),
						option = options[optionName],
						oldValue = option ? option.value : undefined,
						newValue = RESOptionsMigrate.updateValue(oldValue, valueOrFunction);

					if (typeof newValue !== 'undefined') {
						await RESUtils.options.setOption(moduleID, optionName, newValue);
					}
				} catch (e) {
					console.error('Couldn\'t migrate (' + e + '; arguments were ' + Array.prototype.join.call(arguments, ', ') + ')', e.stack);
				}
			},
			async moveOption(oldModuleID, oldOptionName, newModuleID, newOptionName, valueOrFunction) {
				try {
					const options = await RESUtils.options.getOptions(oldModuleID, true),
						option = options[oldOptionName],
						oldValue = option ? option.value : undefined,
						newValue = RESOptionsMigrate.updateValue(oldValue, valueOrFunction);

					if (typeof newValue !== 'undefined') {
						await RESUtils.options.setOption(newModuleID, newOptionName, newValue);
					}
				} catch (e) {
					console.error('Couldn\'t migrate (' + e + '; arguments were ' + Array.prototype.join.call(arguments, ', ') + ')', e.stack);
				}
			},
			async moveStorage(oldKey, newKey, valueOrFunction) {
				const oldValue = await RESEnvironment.storage.getRaw(oldKey);

				if (oldValue === null) {
					return;
				}

				var newValue = RESOptionsMigrate.updateValue(oldValue, valueOrFunction);
				if (typeof newValue !== 'undefined') {
					RESEnvironment.storage.setRaw(newKey, newValue);
				}
			},
			async moveStorageToOption(oldKey, newModuleID, newOptionName, valueOrFunction) {
				const oldValue = await RESEnvironment.storage.getRaw(oldKey);

				if (oldValue === null) {
					return;
				}

				var newValue = RESOptionsMigrate.updateValue(oldValue, valueOrFunction);

				try {
					if (typeof newValue !== 'undefined') {
						await RESUtils.options.setOption(newModuleID, newOptionName, newValue);
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
					var key = distinctColumns.map(function(columnIndex) {
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
			_testSelectDistinctRowsByColumnIndex: function() {
				// TODO: move to qunit file
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
				// compare actual and expected
				debugger; // eslint-disable-line no-debugger
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

				RESEnvironment.storage.setRaw('RESmodules.userTagger.tags', JSON.stringify(this.tags));
				RESEnvironment.storage.setRaw('RESmodules.userTagger.casefix', true);
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

	async migrate() {
		const startMigrationAt = await RESOptionsMigrate.getMigrationStartIndex();
		const migrationVersions = RESOptionsMigrate.getVersionNumbers();

		if (typeof startMigrationAt !== 'undefined') {
			const migrationsToRun = RESOptionsMigrate.migrations.slice(startMigrationAt);

			await RESUtils.async.seq(migrationsToRun, async currentMigration => {
				await currentMigration.go();
				// Checkpoint, in case the next migration crashes
				RESOptionsMigrate.setLastMigratedVersion(currentMigration.versionNumber);
			});

			RESUtils.options.removeObsoleteOptions();
		}

		// Indicate that all the current migrations are satisfied for the next upgrade
		RESOptionsMigrate.setLastMigratedVersion(migrationVersions[migrationVersions.length - 1]);
	},

	async getMigrationStartIndex() {
		const lastMigratedVersion = await RESOptionsMigrate.getLastMigratedVersion();

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
	async getLastMigratedVersion() {
		let RESOptionsVersion = await RESEnvironment.storage.getRaw('RESOptionsVersion');

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
		} else if (await RESEnvironment.storage.has('RES.firstRun.4.5.0.2')) {
			// 4.5.0.2 bug: RESOptionsVersion was not set on fresh installs.
			RESOptionsVersion = '4.5.0.2';
		} else if (await RESEnvironment.storage.has('RES.firstRun.4.3.2.1') || await RESEnvironment.storage.has('RES.firstRun.4.3.1.2') || await RESEnvironment.storage.has('RES.firstRun.4.3.0.3') || await RESEnvironment.storage.has('RES.firstRun.4.2.0.2') || await RESEnvironment.storage.has('RES.firstRun.4.1.5')) {
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
			RESEnvironment.storage.setRaw('RESOptionsVersion', value);
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
