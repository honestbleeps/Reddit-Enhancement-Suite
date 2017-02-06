/* @flow */

import _ from 'lodash';
import { Storage } from '../environment';
import { forEachSeq } from '../utils';
import * as Options from './options';

const migrations = [
	{
		versionNumber: 'legacyMigrators',
		async go() {
			// userbarHider.beforeLoad()
			await migrators.generic.moveStorageToOption('RESmodules.styleTweaks.userbarState', 'userbarHider', 'userbarState');

			// commentTools.migrateData()
			const macroVersion = await Storage.get('RESmodules.commentTools.macroDataVersion');
			if (macroVersion === null || macroVersion === 0) {
				// In this case it is unmigrated or uncreated
				const previewOptions = await Storage.get('RESoptions.commentPreview');
				if (previewOptions !== null) {
					if (typeof previewOptions.commentingAs !== 'undefined') {
						await migrators.generic.forceUpdateOption('commentTools', 'commentingAs', previewOptions.commentingAs.value);
					}
					if (typeof previewOptions.keyboardShortcuts !== 'undefined') {
						await migrators.generic.forceUpdateOption('commentTools', 'keyboardShortcuts', previewOptions.keyboardShortcuts.value);
					}
					if (typeof previewOptions.subredditAutocomplete !== 'undefined') {
						await migrators.generic.forceUpdateOption('commentTools', 'subredditAutocomplete', previewOptions.subredditAutocomplete.value);
					}
					if (typeof previewOptions.macros !== 'undefined') {
						previewOptions.macros.value.forEach(macro => {
							while (macro.length < 4) {
								macro.push('');
							}
						});
						await migrators.generic.forceUpdateOption('commentTools', 'macros', previewOptions.macros.value);
					}
				}
			}
			if (macroVersion === 1) {
				await migrators.generic.forceUpdateOption('commentTools', 'macros', macros =>
					(macros || []).map(macro => {
						while (macro.length < 4) {
							macro.push('');
						}
						return macro;
					})
				);
			}

			// saveComments.loadSavedComments()
			const storedComments = await Storage.get('RESmodules.saveComments.savedComments');
			if (Array.isArray(storedComments)) {
				const newFormat = {};
				for (const i in storedComments) {
					const urlSplit = storedComments[i].href.split('/');
					const thisID = urlSplit[urlSplit.length - 1];
					newFormat[thisID] = storedComments[i];
				}
				Storage.set('RESmodules.saveComments.savedComments', newFormat);
			}
		},
	}, {
		versionNumber: '4.5.0.0',
		async go() {
			await migrators.generic.moveOption('betteReddit', 'searchSubredditByDefault', 'searchHelper', 'searchSubredditByDefault');

			await migrators.generic.moveOption('styleTweaks', 'lightSwitch', 'nightMode', 'nightSwitch');
			await migrators.generic.moveOption('styleTweaks', 'lightOrDark', 'nightMode', 'nightModeOn', migrators.specific.nightModeOn);
			await migrators.generic.moveOption('styleTweaks', 'useSubredditStyleInDarkMode', 'nightMode', 'useSubredditStyles');
			await migrators.generic.moveStorageToOption('RESmodules.styleTweaks.nightModeWhitelist', 'nightMode', 'subredditStylesWhitelist', migrators.specific.subredditStylesWhitelist);

			try {
				const userTags = await Storage.get('RESmodules.userTagger.tags') || {};
				migrators.specific.updateTagStorageCaseInsensitive(userTags);
			} catch (e) {
				console.error('Could not migrate user tags, please post this error to /r/RESissues', e);
			}

			// check for /r/ hack from when reddit changed its format and broke RES filters
			await migrators.generic.forceUpdateOption('filteReddit', 'subreddits', subreddits =>
				(subreddits || []).map(subreddit => {
					const check = subreddit[0];
					if (check.startsWith('/r/')) {
						subreddit[0] = check.substr(3);
					}
					return subreddit;
				})
			);
		},
	}, {
		versionNumber: '4.5.0.2',
		async go() {
			await migrators.generic.updateOption('keyboardNav', 'imageMoveUp', [38, false, false, true, false], [38, false, true, false, false]);
			await migrators.generic.updateOption('keyboardNav', 'imageMoveDown', [40, false, false, true, false], [40, false, true, false, false]);
			await migrators.generic.updateOption('keyboardNav', 'imageMoveLeft', [37, false, false, true, false], [37, false, true, false, false]);
			await migrators.generic.updateOption('keyboardNav', 'imageMoveRight', [39, false, false, true, false], [39, false, true, false, false]);
		},
	}, {
		versionNumber: '4.5.0.3',
		go() {
			// Token migration for the benefit of developers or people running bleeding-edge
		},
	}, {
		versionNumber: '4.5.1',
		async go() {
			await migrators.generic.forceUpdateOption('voteEnhancements', 'colorCommentScore', migrators.specific.colorCommentScore);

			const sticky = (await Options.loadObsolete('notifications')).sticky.value;
			const fg = (await Options.loadObsolete('keyboardNav')).focusFGColorNight.value;
			const bg = (await Options.loadObsolete('keyboardNav')).focusBGColorNight.value;
			const test = document.createElement('div');

			// perNotification may have only been present in dev releases, but check for it and update as it's
			// no longer a valid option.
			if (sticky === 'perNotification') {
				await migrators.generic.forceUpdateOption('notifications', 'sticky', 'notificationType');
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
				await migrators.generic.forceUpdateOption('keyboardNav', 'focusBGColorNight', '#373737');
				await migrators.generic.forceUpdateOption('keyboardNav', 'focusFGColorNight', '#DDDDDD');
			}

			// Show all options for all users
			await migrators.generic.moveOption('settingsNavigation', 'showAdvancedOptions', 'settingsNavigation', 'showAllOptions', true);
			await migrators.generic.moveOption('settingsNavigation', 'showAdvancedOptionsAlert', 'settingsNavigation', 'showAllOptionsAlert');
		},
	}, {
		versionNumber: '4.5.3',
		async go() {
			await migrators.generic.updateOption('searchHelper', 'addSubmitButton', true, false);
			await migrators.generic.moveOption('keyboardNav', 'save', 'keyboardNav', 'savePost');
			await migrators.generic.moveOption('keyboardNav', 'save', 'keyboardNav', 'saveRES');
		},
	}, {
		versionNumber: '4.5.4',
		async go() {
			await migrators.generic.forceUpdateOption('filteReddit', 'keywords', migrators.specific.removeUndefinedUnlessKeyword);
			await migrators.generic.updateOption('quickMessage', 'quickModeratorMessage', false, true);
		},
	}, {
		versionNumber: '4.5.5',
		async go() {
			const scrollTop = (await Options.loadObsolete('keyboardNav')).scrollTop;
			if (scrollTop && scrollTop.value) {
				await migrators.generic.updateOption('keyboardNav', 'scrollStyle', 'directional', 'top');
			}
			await migrators.generic.moveOption('betteReddit', 'uncheckSendRepliesToInbox', 'submitHelper', 'uncheckSendRepliesToInbox');
			await migrators.generic.moveOption('keyboardNav', 'openBigEditor', 'commentPreview', 'openBigEditor');
			await migrators.generic.moveOption('keyboardNav', 'autoSelectOnScroll', 'selectedEntry', 'autoSelectOnScroll');
			await migrators.generic.moveOption('keyboardNav', 'clickFocus', 'selectedEntry', 'selectOnClick');
			await migrators.generic.moveOption('keyboardNav', 'addFocusBGColor', 'selectedEntry', 'addFocusBGColor');
			await migrators.generic.moveOption('keyboardNav', 'focusBGColor', 'selectedEntry', 'focusBGColor');
			await migrators.generic.moveOption('keyboardNav', 'focusBGColorNight', 'selectedEntry', 'focusBGColorNight');
			await migrators.generic.moveOption('keyboardNav', 'focusFGColorNight', 'selectedEntry', 'focusFGColorNight');
			await migrators.generic.moveOption('keyboardNav', 'addFocusBorder', 'selectedEntry', 'addFocusBorder');
			await migrators.generic.moveOption('keyboardNav', 'focusBorder', 'selectedEntry', 'focusBorder');
			await migrators.generic.moveOption('keyboardNav', 'focusBorderNight', 'selectedEntry', 'focusBorderNight');

			await migrators.generic.forceUpdateOption('hover', 'fadeSpeed', migrators.specific.updateFadeSpeed);
			await migrators.generic.forceUpdateOption('showParent', 'fadeSpeed', migrators.specific.updateFadeSpeed);
			await migrators.generic.forceUpdateOption('subredditInfo', 'fadeSpeed', migrators.specific.updateFadeSpeed);
			await migrators.generic.forceUpdateOption('userTagger', 'fadeSpeed', migrators.specific.updateFadeSpeed);
			await migrators.generic.forceUpdateOption('commentTools', 'macros', migrators.specific.commentToolsDefaultMacros);

			await migrators.generic.moveOption('betteReddit', 'showUnreadCount', 'orangered', 'showUnreadCount');
			await migrators.generic.moveOption('betteReddit', 'retroUnreadCount', 'orangered', 'retroUnreadCount');
			await migrators.generic.moveOption('betteReddit', 'showUnreadCountInFavicon', 'orangered', 'showUnreadCountInFavicon');
			await migrators.generic.moveOption('betteReddit', 'unreadLinksToInbox', 'orangered', 'unreadLinksToInbox');
			await migrators.generic.moveOption('betteReddit', 'hideModMail', 'orangered', 'hideModMail');

			await migrators.generic.moveOption('quickMessage', 'quickModeratorMessage', 'quickMessage', 'handleSideLinks');

			await migrators.generic.updateOption('showKarma', 'useCommas', false, true);

			await migrators.generic.moveOption('keyboardNav', 'moveDown', 'keyboardNav', 'moveDownComment');
			await migrators.generic.moveOption('keyboardNav', 'moveUp', 'keyboardNav', 'moveUpComment');

			await migrators.generic.moveOption('userTagger', 'hoverInfo', 'userInfo', 'hoverInfo');
			await migrators.generic.moveOption('userTagger', 'useQuickMessage', 'userInfo', 'useQuickMessage');
			await migrators.generic.moveOption('userTagger', 'hoverDelay', 'userInfo', 'hoverDelay');
			await migrators.generic.moveOption('userTagger', 'fadeDelay', 'userInfo', 'fadeDelay');
			await migrators.generic.moveOption('userTagger', 'fadeSpeed', 'userInfo', 'fadeSpeed');
			await migrators.generic.moveOption('userTagger', 'gildComments', 'userInfo', 'gildComments');
			await migrators.generic.moveOption('userTagger', 'highlightButton', 'userInfo', 'highlightButton');
			await migrators.generic.moveOption('userTagger', 'highlightColor', 'userInfo', 'highlightColor');
			await migrators.generic.moveOption('userTagger', 'highlightColorHover', 'userInfo', 'highlightColorHover');
			await migrators.generic.moveOption('userTagger', 'USDateFormat', 'userInfo', 'USDateFormat');

			await migrators.generic.forceUpdateOption('notifications', 'notificationTypes', rows =>
				_.uniqBy(rows, ([modId, notificationId]) => `${modId}###${notificationId}`)
			);
		},
	}, {
		versionNumber: '4.7.0-scrubCaches',
		async go() {
			// Trailing '.' on some keys is important
			const cacheKeyParts = [
				'RESmodules.neverEndingReddit.lastPage',
				'RESmodules.neverEndingReddit.lastVisibleIndex',
				'RESUtils.cache',
				'RESUtils.moderatedSubCache',
				'RESUtils.sendFromCache',
				'RESUtils.userInfoCache',
				'RESmodules.keyboardNavLastIndex',
				'RESmodules.selectedThing.lastSelectedCache',
				'TBCache.', // may have been copied from foreground
				'Toolbox.',
				'RESmodules.betteReddit.msgCount.lastCheck',
				'RESmodules.subredditManager.subreddits.',
				'RESmodules.subredditManager.mySubredditList',
			];

			await (await Storage.keys())
				.filter(key => cacheKeyParts.some(part => key.includes(part)))
				.map(key => Storage.delete(key));
		},
	}, {
		versionNumber: '4.7.0-voteWeight',
		async go() {
			await migrators.generic.moveOption('userTagger', 'colorUser', 'userTagger', 'trackVoteWeight');
		},
	}, {
		versionNumber: '4.7.0-commentStyle',
		async go() {
			await migrators.generic.moveOption('styleTweaks', 'commentBoxes', 'commentStyle', 'commentBoxes');
			await migrators.generic.moveOption('styleTweaks', 'commentRounded', 'commentStyle', 'commentRounded');
			await migrators.generic.moveOption('styleTweaks', 'commentHoverBorder', 'commentStyle', 'commentHoverBorder');
			await migrators.generic.moveOption('styleTweaks', 'commentIndent', 'commentStyle', 'commentIndent');
			await migrators.generic.moveOption('styleTweaks', 'continuity', 'commentStyle', 'continuity');
		},
	}, {
		versionNumber: '4.7.0-keyboardNav-scrollStyle-better-name',
		async go() {
			await migrators.generic.moveOption('keyboardNav', 'scrollStyle', 'keyboardNav', 'linearScrollStyle');
		},
	}, {
		versionNumber: '4.7.0-hideLEC',
		async go() {
			await migrators.generic.updateOption('singleClick', 'hideLEC', false, true);
		},
	}, {
		versionNumber: '4.7.0-showImages-siteModuleIDs',
		async go() {
			await migrators.generic.moveOption('showImages', 'display uploadly', 'showImages', 'display_uploadly');
			await migrators.generic.moveOption('showImages', 'display eroshare', 'showImages', 'display_eroshare');
			await migrators.generic.moveOption('showImages', 'display iLoopit - gif maker', 'showImages', 'display_iloopit');
			await migrators.generic.moveOption('showImages', 'display Coub', 'showImages', 'display_coub');
			await migrators.generic.moveOption('showImages', 'display LiveCap', 'showImages', 'display_livecap');
			await migrators.generic.moveOption('showImages', 'display twitter', 'showImages', 'display_twitter');
			await migrators.generic.moveOption('showImages', 'display futurism', 'showImages', 'display_futurism');
			await migrators.generic.moveOption('showImages', 'display gfycat', 'showImages', 'display_gfycat');
			await migrators.generic.moveOption('showImages', 'display gifyoutube', 'showImages', 'display_gifs');
			await migrators.generic.moveOption('showImages', 'display vidble', 'showImages', 'display_vidble');
			await migrators.generic.moveOption('showImages', 'display fitbamob', 'showImages', 'display_fitbamob');
			await migrators.generic.moveOption('showImages', 'display giflike', 'showImages', 'display_giflike');
			await migrators.generic.moveOption('showImages', 'display CtrlV.in', 'showImages', 'display_ctrlv');
			await migrators.generic.moveOption('showImages', 'display snag.gy', 'showImages', 'display_snag');
			await migrators.generic.moveOption('showImages', 'display picshd', 'showImages', 'display_picshd');
			await migrators.generic.moveOption('showImages', 'display min.us', 'showImages', 'display_minus');
			await migrators.generic.moveOption('showImages', 'display fiveHundredPx', 'showImages', 'display_fiveHundredPx');
			await migrators.generic.moveOption('showImages', 'display flickr', 'showImages', 'display_flickr');
			await migrators.generic.moveOption('showImages', 'display steam', 'showImages', 'display_steam');
			await migrators.generic.moveOption('showImages', 'display deviantART', 'showImages', 'display_deviantart');
			await migrators.generic.moveOption('showImages', 'display tumblr', 'showImages', 'display_tumblr');
			await migrators.generic.moveOption('showImages', 'display memecrunch', 'showImages', 'display_memecrunch');
			await migrators.generic.moveOption('showImages', 'display imgflip', 'showImages', 'display_imgflip');
			await migrators.generic.moveOption('showImages', 'display livememe', 'showImages', 'display_livememe');
			await migrators.generic.moveOption('showImages', 'display makeameme', 'showImages', 'display_makeameme');
			await migrators.generic.moveOption('showImages', 'display memegen', 'showImages', 'display_memegen');
			await migrators.generic.moveOption('showImages', 'display redditbooru', 'showImages', 'display_redditbooru');
			await migrators.generic.moveOption('showImages', 'display youtube', 'showImages', 'display_youtube');
			await migrators.generic.moveOption('showImages', 'display vimeo', 'showImages', 'display_vimeo');
			await migrators.generic.moveOption('showImages', 'display soundcloud', 'showImages', 'display_soundcloud');
			await migrators.generic.moveOption('showImages', 'display clyp', 'showImages', 'display_clyp');
			await migrators.generic.moveOption('showImages', 'display memedad', 'showImages', 'display_memedad');
			await migrators.generic.moveOption('showImages', 'display ridewithgps', 'showImages', 'display_ridewithgps');
			await migrators.generic.moveOption('showImages', 'display photobucket', 'showImages', 'display_photobucket');
			await migrators.generic.moveOption('showImages', 'display giphy', 'showImages', 'display_giphy');
			await migrators.generic.moveOption('showImages', 'display streamable', 'showImages', 'display_streamable');
			await migrators.generic.moveOption('showImages', 'display qwipit', 'showImages', 'display_qwipit');
			await migrators.generic.moveOption('showImages', 'display radd.it', 'showImages', 'display_raddit');
			await migrators.generic.moveOption('showImages', 'display pastebin', 'showImages', 'display_pastebin');
			await migrators.generic.moveOption('showImages', 'display github gists', 'showImages', 'display_github');
			await migrators.generic.moveOption('showImages', 'display Microsoft OneDrive', 'showImages', 'display_onedrive');
			await migrators.generic.moveOption('showImages', 'display Oddshot', 'showImages', 'display_oddshot');
			await migrators.generic.moveOption('showImages', 'display Miiverse', 'showImages', 'display_miiverse');
			await migrators.generic.moveOption('showImages', 'display swirl', 'showImages', 'display_swirl');
		},
	}, {
		versionNumber: '4.7.1-changeDefaultImageMaxSizeRetry',
		async go() {
			await migrators.generic.updateOption('showImages', 'maxWidth', 640, '100%');
			await migrators.generic.updateOption('showImages', 'maxHeight', 480, '80%');
			await migrators.generic.updateOption('showImages', 'maxWidth', '640', '100%');
			await migrators.generic.updateOption('showImages', 'maxHeight', '480', '80%');
		},
	}, {
		versionNumber: '4.7.4-galleryFilmstripGranularity',
		async go() {
			await migrators.generic.moveOption('showImages', 'dontLoadAlbumsBiggerThan', 'showImages', 'filmstripLoadIncrement');
		},
	}, {
		versionNumber: '4.7.8-ner-hide-dupes',
		async go() {
			await migrators.generic.updateOption('neverEndingReddit', 'hideDupes', 'fade', 'hide');
		},
	}, {
		versionNumber: '5.0.1-disable-redditmedia-lookup',
		async go() {
			await migrators.generic.forceUpdateOption('showImages', 'expandoCommentRedirects', 'nothing');
		},
	}, {
		versionNumber: '5.0.2-reenable-redditmedia-expando',
		async go() {
			await migrators.generic.updateOption('showImages', 'expandoCommentRedirects', 'nothing', 'expando');
		},
	}, {
		versionNumber: '5.1.1-remove-multiredditnavbar-sectionlinks-workaround',
		async go() {
			await migrators.generic.forceUpdateOption('multiredditNavbar', 'sectionLinks', migrators.specific.resetLeadingDots);
		},
	}, {
		versionNumber: '5.3.1-enable-hardIgnore',
		async go() {
			await migrators.generic.forceUpdateOption('userTagger', 'hardIgnore', true);
		},
	}, {
		versionNumber: '5.3.5-remove-updates-css',
		async go() {
			await migrators.generic.forceUpdateOption('stylesheet', 'loadStylesheets', rows =>
				rows && rows.filter(row => row[0] !== 'https://cdn.redditenhancementsuite.com/updates.css')
			);

			const hideFloatingPauseButton = 'res-neverEndingReddit-hideFloatingPauseButton';
			await migrators.generic.moveOption('stylesheet', 'bodyClasses', 'neverEndingReddit', 'showPauseButton', rows =>
				!!rows && rows.every(row => row[0] !== hideFloatingPauseButton)
			);
			await migrators.generic.forceUpdateOption('stylesheet', 'bodyClasses', rows =>
				rows && rows.filter(row => row[0] !== hideFloatingPauseButton)
			);

			let shouldHideTagline = false;
			await migrators.generic.forceUpdateOption('stylesheet', 'bodyClasses', rows => {
				if (!rows) return [];
				const filteredRows = rows.filter(row => row[0] !== 'res-hide-tagline-frontpage');
				shouldHideTagline = filteredRows.length < rows.length;
				return filteredRows;
			});
			if (shouldHideTagline) {
				migrators.generic.forceUpdateOption('stylesheet', 'snippets', rows => [
					...(rows || []),
					[
						'/* migrated from res-hide-tagline-frontpage */ .front-page .tagline { display: none; }',
						'everywhere',
					],
				]);
			}
		},
	}, {
		versionNumber: '5.3.6-enable-hideUnvotable',
		async go() {
			await migrators.generic.forceUpdateOption('styleTweaks', 'hideUnvotable', true);
		},
	}, {
		versionNumber: '5.3.7-automaticNightMode-to-enum',
		async go() {
			await migrators.generic.forceUpdateOption('nightMode', 'automaticNightMode', value => (value === true) ? 'user' : 'none');
		},
	},

];  // ^^ Add new migrations ^^

const migrators = {
	generic: {
		async updateOption(moduleID, optionName, formerDefaultValue, valueOrFunction) {
			try {
				const options = await Options.loadObsolete(moduleID);
				const option = options[optionName];
				const oldValue = option ? option.value : undefined;
				const newValue = updateValue(oldValue, valueOrFunction);

				// Only update this option to the new default value if its current value
				// hasn't been changed from the former default value.
				if (optionMatchesFormerDefaultValue(option, formerDefaultValue)) {
					await Options.set(moduleID, optionName, newValue);
				}
			} catch (e) {
				console.error(`Couldn't migrate ${moduleID}::${optionName} from`, formerDefaultValue, 'to/via', valueOrFunction, e);
			}
		},
		async forceUpdateOption(moduleID, optionName, valueOrFunction) {
			// ☢ ☠ ☣  DANGER, WILL ROBINSON, DANGER ☠ ☣ ☢
			// Make sure valueOrFunction doesn't destroy user settings!

			try {
				const options = await Options.loadObsolete(moduleID);
				const option = options[optionName];
				const oldValue = option ? option.value : undefined;
				const newValue = updateValue(oldValue, valueOrFunction);

				if (typeof newValue !== 'undefined') {
					await Options.set(moduleID, optionName, newValue);
				}
			} catch (e) {
				console.error(`Couldn't migrate ${moduleID}::${optionName} to`, valueOrFunction, e);
			}
		},
		async moveOption(oldModuleID, oldOptionName, newModuleID, newOptionName, valueOrFunction) {
			try {
				const options = await Options.loadObsolete(oldModuleID);
				const option = options[oldOptionName];
				const oldValue = option ? option.value : undefined;
				const newValue = updateValue(oldValue, valueOrFunction);

				if (typeof newValue !== 'undefined') {
					await Options.set(newModuleID, newOptionName, newValue);
				}
			} catch (e) {
				console.error(`Couldn't migrate ${oldModuleID}::${oldOptionName} to ${newModuleID}::${newOptionName} via`, valueOrFunction, e);
			}
		},
		async moveStorage(oldKey, newKey, valueOrFunction) {
			const oldValue = await Storage.get(oldKey);

			if (oldValue === null) {
				return;
			}

			const newValue = updateValue(oldValue, valueOrFunction);
			if (typeof newValue !== 'undefined') {
				Storage.set(newKey, newValue);
			}
		},
		async moveStorageToOption(oldKey, newModuleID, newOptionName, valueOrFunction) {
			const oldValue = await Storage.get(oldKey);

			if (oldValue === null) {
				return;
			}

			const newValue = updateValue(oldValue, valueOrFunction);

			try {
				if (typeof newValue !== 'undefined') {
					await Options.set(newModuleID, newOptionName, newValue);
				}
			} catch (e) {
				console.error(`Couldn't migrate storage ${oldKey} to ${newModuleID}::${newOptionName} via`, valueOrFunction, e);
			}
		},
		splitRowsByListColumn(columnIndex, rows) {
			if (!rows) {
				return [];
			}
			return rows
				.map(row => {
					const splitColumnItems = row[columnIndex].split(',');
					return splitColumnItems.map(columnItem => {
						const splitRow = row.slice();
						splitRow[columnIndex] = columnItem;
						return splitRow;
					});
				})
				.reduce((array, current) => array.concat(current), []);
		},
	},
	specific: {
		nightModeOn(value) {
			return value === 'dark';
		},
		subredditStylesWhitelist(value) {
			try {
				return JSON.parse(value || '').join(',');
			} catch (e) {
				return '';
			}
		},
		colorCommentScore(value) {
			// v4.5.0.2 (fresh installs) onwards have the correct default value
			if (typeof value === 'string') {
				return value;
			}

			// 4.5.0.1 migration
			return value ? 'automatic' : 'none';
		},
		removeUndefinedUnlessKeyword(values) {
			for (const value of values || []) {
				if (value && value[3] === 'undefined') {
					value[3] = '';
				}
			}

			return values;
		},
		updateFadeSpeed(value) {
			if (value === undefined || value === null || isNaN(value) || value < 0 || value > 1) {
				return '0.7';
			} else {
				return (1 - value).toFixed(2);
			}
		},
		commentToolsDefaultMacros(value) {
			return [
				['reddiquette', '[reddiquette](/wiki/reddiquette) '],
				['Promote RES', '[Reddit Enhancement Suite](http://redditenhancementsuite.com "also /r/Enhancement") '],
				['Current timestamp', '{{now}} '],
				...(value || []),
			];
		},
		updateTagStorageCaseInsensitive(tags) {
			const usernames = Object.keys(tags);

			for (const username of usernames) {
				const lower = username.toLowerCase();
				if (lower === username) continue;

				const destination = tags[lower] = tags[lower] || {};
				const source = tags[username];

				if (source.votes) {
					destination.votes = (parseInt(destination.votes, 10) || 0) + (parseInt(source.votes, 10) || 0);
				}
				if (source.color && (!destination.color || destination.color === 'none')) {
					destination.color = source.color;
				}

				if (source.tag) {
					destination.tag = destination.tag ? `${destination.tag} | ` : '';
					destination.tag += source.tag;
				}

				if (source.ignore) {
					destination.ignore = source.ignore;
				}

				if (source.link) {
					if (destination.link) {
						destination.tag = destination.tag ? `${destination.tag} | ` : '';
						destination.tag += source.link;
					} else {
						destination.link = source.link;
					}
				}

				delete tags[username]; // safe because of "lower === username.toLowerCase" guard above
			}

			Storage.set('RESmodules.userTagger.tags', tags);
			Storage.set('RESmodules.userTagger.casefix', true);
		},
		resetLeadingDots(sectionLinks) {
			if (!sectionLinks) return;
			for (const row of sectionLinks) {
				row[1] = row[1].replace(/^\.\.\//, './');
			}
		},
	},
};

export async function migrate() {
	const startMigrationAt = await getMigrationStartIndex();
	const migrationVersions = getVersionNumbers();

	if (typeof startMigrationAt !== 'undefined') {
		const migrationsToRun = migrations.slice(startMigrationAt);

		await forEachSeq(migrationsToRun, async currentMigration => {
			await currentMigration.go();
			// Checkpoint, in case the next migration crashes
			setLastMigratedVersion(currentMigration.versionNumber);
		});
	}

	// Indicate that all the current migrations are satisfied for the next upgrade
	setLastMigratedVersion(migrationVersions[migrationVersions.length - 1]);
}

async function getMigrationStartIndex() {
	const lastMigratedVersion = await getLastMigratedVersion();

	if (lastMigratedVersion !== false) {
		let startIndex = 0;

		if (typeof lastMigratedVersion === 'string') {
			// Already ran migrations up to and including lastMigratedVersion
			// Start at the migration directly following
			const migrationVersions = getVersionNumbers();
			startIndex = migrationVersions.indexOf(lastMigratedVersion) + 1;
		}

		return startIndex;
	}
}

// Returns a string like "4.5.0.1" (the last migration run),
// null (no migrations run yet), or false (do not run migrations)
async function getLastMigratedVersion() {
	let RESOptionsVersion = await Storage.get('RESOptionsVersion');

	if (typeof RESOptionsVersion === 'undefined') {
		// Error occured sometime in the past, abort
		console.warn('RESOptionsVersion was undefined');
	} else if (RESOptionsVersion !== null) {
		// Migration has run before; verify/sanitize the version number
		if (/^\d$/.test(RESOptionsVersion)) {
			// Legacy format: integer number
			const legacyOptionVersionMapping = ['4.5.0.0', '4.5.0.1'];
			RESOptionsVersion = legacyOptionVersionMapping[RESOptionsVersion - 1];
		} else if (!getVersionNumbers().includes(RESOptionsVersion)) {
			// Abort, abort! Probably downgraded
			console.warn(`Couldn't find a migration matching RESOptionsVersion = ${RESOptionsVersion}`);
			RESOptionsVersion = false;
		} else {
			// RESOptionsVersion is a valid migration version number
		}
	} else if (await Storage.has('RES.firstRun.4.5.0.2')) {
		// 4.5.0.2 bug: RESOptionsVersion was not set on fresh installs.
		RESOptionsVersion = '4.5.0.2';
	} else if (
		await Storage.has('RES.firstRun.4.3.2.1') ||
		await Storage.has('RES.firstRun.4.3.1.2') ||
		await Storage.has('RES.firstRun.4.3.0.3') ||
		await Storage.has('RES.firstRun.4.2.0.2') ||
		await Storage.has('RES.firstRun.4.1.5')
	) {
		// Upgraded from old version to a version which supports migrations; run all migrations
		RESOptionsVersion = null;
	} else {
		// New install, no migrations necessary
		RESOptionsVersion = false;
	}

	return RESOptionsVersion;
}

function setLastMigratedVersion(value) {
	if (value) {
		Storage.set('RESOptionsVersion', value);
	}
}


function getVersionNumbers() {
	return migrations.map(migration => migration.versionNumber);
}

// This function compares a given option value to its "former default" -- the default
// before an attempted migration. Options aren't always a string, so equivalency won't
// work. Note that "option" needs to be the actual option object, NOT option.value.
function optionMatchesFormerDefaultValue(option, formerDefaultValue) {
	if (!option) {
		option = {
			type: 'legacy',
			value: undefined,
		};
	}
	const oldValue = option.value;

	// keyCodes once customized also save metaKey in a 5th index, but we used
	// to not store the metakey, so they have a length of 4 by default. In order
	// to do a proper array comparison, we need the lengths to match, so if a
	// 5th element is not present, push false into the array.
	if (oldValue && (option.type === 'keycode') && (option.value.length === 4)) {
		oldValue.push(false);
	}

	// Check if the oldValue differs from the former default value. If it doesn't,
	// then the user set something custom and we should honor that.
	return _.isEqual(formerDefaultValue, oldValue);
}

function updateValue(oldValue, valueOrFunction) {
	if (typeof valueOrFunction === 'function') {
		return valueOrFunction(oldValue);
	} else if (typeof valueOrFunction !== 'undefined') {
		return valueOrFunction;
	} else {
		return oldValue;
	}
}
