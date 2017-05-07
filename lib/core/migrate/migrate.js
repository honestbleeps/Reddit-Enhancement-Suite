/* @flow */

import _ from 'lodash';
import { Storage } from '../../environment';
import { forEachSeq } from '../../utils';
import * as Modules from '../modules';
import * as Options from '../options';
import * as Migrators from './migrators';

const migrations = [
	{
		versionNumber: 'legacyMigrators',
		async go() {
			// userbarHider.beforeLoad()
			await Migrators.moveStorageToOption('RESmodules.styleTweaks.userbarState', 'userbarHider', 'userbarState');

			// commentTools.migrateData()
			const macroVersion = await Storage.get('RESmodules.commentTools.macroDataVersion');
			if (macroVersion === null || macroVersion === 0) {
				// In this case it is unmigrated or uncreated
				const previewOptions = await Storage.get('RESoptions.commentPreview');
				if (previewOptions !== null) {
					if (typeof previewOptions.commentingAs !== 'undefined') {
						await Migrators.forceUpdateOption('commentTools', 'commentingAs', previewOptions.commentingAs.value);
					}
					if (typeof previewOptions.keyboardShortcuts !== 'undefined') {
						await Migrators.forceUpdateOption('commentTools', 'keyboardShortcuts', previewOptions.keyboardShortcuts.value);
					}
					if (typeof previewOptions.subredditAutocomplete !== 'undefined') {
						await Migrators.forceUpdateOption('commentTools', 'subredditAutocomplete', previewOptions.subredditAutocomplete.value);
					}
					if (typeof previewOptions.macros !== 'undefined') {
						previewOptions.macros.value.forEach(macro => {
							while (macro.length < 4) {
								macro.push('');
							}
						});
						await Migrators.forceUpdateOption('commentTools', 'macros', previewOptions.macros.value);
					}
				}
			}
			if (macroVersion === 1) {
				await Migrators.forceUpdateOption('commentTools', 'macros', macros =>
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
			await Migrators.moveOption('betteReddit', 'searchSubredditByDefault', 'searchHelper', 'searchSubredditByDefault');

			await Migrators.moveOption('styleTweaks', 'lightSwitch', 'nightMode', 'nightSwitch');
			await Migrators.moveOption('styleTweaks', 'lightOrDark', 'nightMode', 'nightModeOn', value => (value === 'dark'));
			await Migrators.moveOption('styleTweaks', 'useSubredditStyleInDarkMode', 'nightMode', 'useSubredditStyles');

			await Migrators.moveStorageToOption('RESmodules.styleTweaks.nightModeWhitelist', 'nightMode', 'subredditStylesWhitelist', value => {
				try {
					return JSON.parse(value || '').join(',');
				} catch (e) {
					return '';
				}
			});

			try {
				const userTags = await Storage.get('RESmodules.userTagger.tags') || {};
				updateTagStorageCaseInsensitive(userTags);
			} catch (e) {
				console.error('Could not migrate user tags, please post this error to /r/RESissues', e);
			}

			// check for /r/ hack from when reddit changed its format and broke RES filters
			await Migrators.forceUpdateOption('filteReddit', 'subreddits', subreddits =>
				(subreddits || []).map(subreddit => {
					const check = subreddit[0];
					if (check.startsWith('/r/')) {
						subreddit[0] = check.substr(3);
					}
					return subreddit;
				})
			);

			function updateTagStorageCaseInsensitive(tags) {
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
			}
		},
	}, {
		versionNumber: '4.5.0.2',
		async go() {
			await Migrators.updateOption('keyboardNav', 'imageMoveUp', [38, false, false, true, false], [38, false, true, false, false]);
			await Migrators.updateOption('keyboardNav', 'imageMoveDown', [40, false, false, true, false], [40, false, true, false, false]);
			await Migrators.updateOption('keyboardNav', 'imageMoveLeft', [37, false, false, true, false], [37, false, true, false, false]);
			await Migrators.updateOption('keyboardNav', 'imageMoveRight', [39, false, false, true, false], [39, false, true, false, false]);
		},
	}, {
		versionNumber: '4.5.0.3',
		go() {
			// Token migration for the benefit of developers or people running bleeding-edge
		},
	}, {
		versionNumber: '4.5.1',
		async go() {
			await Migrators.forceUpdateOption('voteEnhancements', 'colorCommentScore', value => {
				// v4.5.0.2 (fresh installs) onwards have the correct default value
				if (typeof value === 'string') {
					return value;
				}

				// 4.5.0.1 migration
				return value ? 'automatic' : 'none';
			});

			const notificationsOptions = await Options.loadRaw('notifications');
			const sticky = notificationsOptions && notificationsOptions.sticky.value;
			const keyNavOptions = await Options.loadRaw('keyboardNav');
			const fg = keyNavOptions && keyNavOptions.focusFGColorNight.value;
			const bg = keyNavOptions && keyNavOptions.focusBGColorNight.value;
			const test = document.createElement('div');

			// perNotification may have only been present in dev releases, but check for it and update as it's
			// no longer a valid option.
			if (sticky === 'perNotification') {
				await Migrators.forceUpdateOption('notifications', 'sticky', 'notificationType');
			}

			// If night mode focus foreground color === night mode focus background color,
			// force them back to new defaults.
			//
			// Since it may be rgba or hex and we're not sure, let's do something clever to
			// make sure we can compare the colors.
			test.style.color = fg || '';
			test.style.backgroundColor = bg || '';
			const fgCalculated = test.style.color;
			const bgCalculated = test.style.backgroundColor;
			if ((fg === bg) || (fgCalculated === bgCalculated)) {
				await Migrators.forceUpdateOption('keyboardNav', 'focusBGColorNight', '#373737');
				await Migrators.forceUpdateOption('keyboardNav', 'focusFGColorNight', '#DDDDDD');
			}

			// Show all options for all users
			await Migrators.moveOption('settingsNavigation', 'showAdvancedOptions', 'settingsNavigation', 'showAllOptions', true);
			await Migrators.moveOption('settingsNavigation', 'showAdvancedOptionsAlert', 'settingsNavigation', 'showAllOptionsAlert');
		},
	}, {
		versionNumber: '4.5.3',
		async go() {
			await Migrators.updateOption('searchHelper', 'addSubmitButton', true, false);
			await Migrators.moveOption('keyboardNav', 'save', 'keyboardNav', 'savePost');
			await Migrators.moveOption('keyboardNav', 'save', 'keyboardNav', 'saveRES');
		},
	}, {
		versionNumber: '4.5.4',
		async go() {
			await Migrators.forceUpdateOption('filteReddit', 'keywords', values => {
				for (const value of values || []) {
					if (value && value[3] === 'undefined') {
						value[3] = '';
					}
				}

				return values;
			});
			await Migrators.updateOption('quickMessage', 'quickModeratorMessage', false, true);
		},
	}, {
		versionNumber: '4.5.5',
		async go() {
			const keyNavOptions = await Options.loadRaw('keyboardNav');
			if (keyNavOptions && keyNavOptions.scrollTop && keyNavOptions.scrollTop.value) {
				await Migrators.updateOption('keyboardNav', 'scrollStyle', 'directional', 'top');
			}
			await Migrators.moveOption('betteReddit', 'uncheckSendRepliesToInbox', 'submitHelper', 'uncheckSendRepliesToInbox');
			await Migrators.moveOption('keyboardNav', 'openBigEditor', 'commentPreview', 'openBigEditor');
			await Migrators.moveOption('keyboardNav', 'autoSelectOnScroll', 'selectedEntry', 'autoSelectOnScroll');
			await Migrators.moveOption('keyboardNav', 'clickFocus', 'selectedEntry', 'selectOnClick');
			await Migrators.moveOption('keyboardNav', 'addFocusBGColor', 'selectedEntry', 'addFocusBGColor');
			await Migrators.moveOption('keyboardNav', 'focusBGColor', 'selectedEntry', 'focusBGColor');
			await Migrators.moveOption('keyboardNav', 'focusBGColorNight', 'selectedEntry', 'focusBGColorNight');
			await Migrators.moveOption('keyboardNav', 'focusFGColorNight', 'selectedEntry', 'focusFGColorNight');
			await Migrators.moveOption('keyboardNav', 'addFocusBorder', 'selectedEntry', 'addFocusBorder');
			await Migrators.moveOption('keyboardNav', 'focusBorder', 'selectedEntry', 'focusBorder');
			await Migrators.moveOption('keyboardNav', 'focusBorderNight', 'selectedEntry', 'focusBorderNight');

			function updateFadeSpeed(value) {
				if (value === undefined || value === null || isNaN(value) || value < 0 || value > 1) {
					return '0.7';
				} else {
					return (1 - value).toFixed(2);
				}
			}

			await Migrators.forceUpdateOption('hover', 'fadeSpeed', updateFadeSpeed);
			await Migrators.forceUpdateOption('showParent', 'fadeSpeed', updateFadeSpeed);
			await Migrators.forceUpdateOption('subredditInfo', 'fadeSpeed', updateFadeSpeed);
			await Migrators.forceUpdateOption('userTagger', 'fadeSpeed', updateFadeSpeed);

			await Migrators.forceUpdateOption('commentTools', 'macros', value =>
				[
					['reddiquette', '[reddiquette](/wiki/reddiquette) '],
					['Promote RES', '[Reddit Enhancement Suite](https://redditenhancementsuite.com "also /r/Enhancement") '],
					['Current timestamp', '{{now}} '],
					...(value || []),
				]
			);

			await Migrators.moveOption('betteReddit', 'showUnreadCount', 'orangered', 'showUnreadCount');
			await Migrators.moveOption('betteReddit', 'retroUnreadCount', 'orangered', 'retroUnreadCount');
			await Migrators.moveOption('betteReddit', 'showUnreadCountInFavicon', 'orangered', 'showUnreadCountInFavicon');
			await Migrators.moveOption('betteReddit', 'unreadLinksToInbox', 'orangered', 'unreadLinksToInbox');
			await Migrators.moveOption('betteReddit', 'hideModMail', 'orangered', 'hideModMail');

			await Migrators.moveOption('quickMessage', 'quickModeratorMessage', 'quickMessage', 'handleSideLinks');

			await Migrators.updateOption('showKarma', 'useCommas', false, true);

			await Migrators.moveOption('keyboardNav', 'moveDown', 'keyboardNav', 'moveDownComment');
			await Migrators.moveOption('keyboardNav', 'moveUp', 'keyboardNav', 'moveUpComment');

			await Migrators.moveOption('userTagger', 'hoverInfo', 'userInfo', 'hoverInfo');
			await Migrators.moveOption('userTagger', 'useQuickMessage', 'userInfo', 'useQuickMessage');
			await Migrators.moveOption('userTagger', 'hoverDelay', 'userInfo', 'hoverDelay');
			await Migrators.moveOption('userTagger', 'fadeDelay', 'userInfo', 'fadeDelay');
			await Migrators.moveOption('userTagger', 'fadeSpeed', 'userInfo', 'fadeSpeed');
			await Migrators.moveOption('userTagger', 'gildComments', 'userInfo', 'gildComments');
			await Migrators.moveOption('userTagger', 'highlightButton', 'userInfo', 'highlightButton');
			await Migrators.moveOption('userTagger', 'highlightColor', 'userInfo', 'highlightColor');
			await Migrators.moveOption('userTagger', 'highlightColorHover', 'userInfo', 'highlightColorHover');
			await Migrators.moveOption('userTagger', 'USDateFormat', 'userInfo', 'USDateFormat');

			await Migrators.forceUpdateOption('notifications', 'notificationTypes', rows =>
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
			await Migrators.moveOption('userTagger', 'colorUser', 'userTagger', 'trackVoteWeight');
		},
	}, {
		versionNumber: '4.7.0-commentStyle',
		async go() {
			await Migrators.moveOption('styleTweaks', 'commentBoxes', 'commentStyle', 'commentBoxes');
			await Migrators.moveOption('styleTweaks', 'commentRounded', 'commentStyle', 'commentRounded');
			await Migrators.moveOption('styleTweaks', 'commentHoverBorder', 'commentStyle', 'commentHoverBorder');
			await Migrators.moveOption('styleTweaks', 'commentIndent', 'commentStyle', 'commentIndent');
			await Migrators.moveOption('styleTweaks', 'continuity', 'commentStyle', 'continuity');
		},
	}, {
		versionNumber: '4.7.0-keyboardNav-scrollStyle-better-name',
		async go() {
			await Migrators.moveOption('keyboardNav', 'scrollStyle', 'keyboardNav', 'linearScrollStyle');
		},
	}, {
		versionNumber: '4.7.0-hideLEC',
		async go() {
			await Migrators.updateOption('singleClick', 'hideLEC', false, true);
		},
	}, {
		versionNumber: '4.7.0-showImages-siteModuleIDs',
		async go() {
			await Migrators.moveOption('showImages', 'display uploadly', 'showImages', 'display_uploadly');
			await Migrators.moveOption('showImages', 'display eroshare', 'showImages', 'display_eroshare');
			await Migrators.moveOption('showImages', 'display iLoopit - gif maker', 'showImages', 'display_iloopit');
			await Migrators.moveOption('showImages', 'display Coub', 'showImages', 'display_coub');
			await Migrators.moveOption('showImages', 'display LiveCap', 'showImages', 'display_livecap');
			await Migrators.moveOption('showImages', 'display twitter', 'showImages', 'display_twitter');
			await Migrators.moveOption('showImages', 'display futurism', 'showImages', 'display_futurism');
			await Migrators.moveOption('showImages', 'display gfycat', 'showImages', 'display_gfycat');
			await Migrators.moveOption('showImages', 'display gifyoutube', 'showImages', 'display_gifs');
			await Migrators.moveOption('showImages', 'display vidble', 'showImages', 'display_vidble');
			await Migrators.moveOption('showImages', 'display fitbamob', 'showImages', 'display_fitbamob');
			await Migrators.moveOption('showImages', 'display giflike', 'showImages', 'display_giflike');
			await Migrators.moveOption('showImages', 'display CtrlV.in', 'showImages', 'display_ctrlv');
			await Migrators.moveOption('showImages', 'display snag.gy', 'showImages', 'display_snag');
			await Migrators.moveOption('showImages', 'display picshd', 'showImages', 'display_picshd');
			await Migrators.moveOption('showImages', 'display min.us', 'showImages', 'display_minus');
			await Migrators.moveOption('showImages', 'display fiveHundredPx', 'showImages', 'display_fiveHundredPx');
			await Migrators.moveOption('showImages', 'display flickr', 'showImages', 'display_flickr');
			await Migrators.moveOption('showImages', 'display steam', 'showImages', 'display_steam');
			await Migrators.moveOption('showImages', 'display deviantART', 'showImages', 'display_deviantart');
			await Migrators.moveOption('showImages', 'display tumblr', 'showImages', 'display_tumblr');
			await Migrators.moveOption('showImages', 'display memecrunch', 'showImages', 'display_memecrunch');
			await Migrators.moveOption('showImages', 'display imgflip', 'showImages', 'display_imgflip');
			await Migrators.moveOption('showImages', 'display livememe', 'showImages', 'display_livememe');
			await Migrators.moveOption('showImages', 'display makeameme', 'showImages', 'display_makeameme');
			await Migrators.moveOption('showImages', 'display memegen', 'showImages', 'display_memegen');
			await Migrators.moveOption('showImages', 'display redditbooru', 'showImages', 'display_redditbooru');
			await Migrators.moveOption('showImages', 'display youtube', 'showImages', 'display_youtube');
			await Migrators.moveOption('showImages', 'display vimeo', 'showImages', 'display_vimeo');
			await Migrators.moveOption('showImages', 'display soundcloud', 'showImages', 'display_soundcloud');
			await Migrators.moveOption('showImages', 'display clyp', 'showImages', 'display_clyp');
			await Migrators.moveOption('showImages', 'display memedad', 'showImages', 'display_memedad');
			await Migrators.moveOption('showImages', 'display ridewithgps', 'showImages', 'display_ridewithgps');
			await Migrators.moveOption('showImages', 'display photobucket', 'showImages', 'display_photobucket');
			await Migrators.moveOption('showImages', 'display giphy', 'showImages', 'display_giphy');
			await Migrators.moveOption('showImages', 'display streamable', 'showImages', 'display_streamable');
			await Migrators.moveOption('showImages', 'display qwipit', 'showImages', 'display_qwipit');
			await Migrators.moveOption('showImages', 'display radd.it', 'showImages', 'display_raddit');
			await Migrators.moveOption('showImages', 'display pastebin', 'showImages', 'display_pastebin');
			await Migrators.moveOption('showImages', 'display github gists', 'showImages', 'display_github');
			await Migrators.moveOption('showImages', 'display Microsoft OneDrive', 'showImages', 'display_onedrive');
			await Migrators.moveOption('showImages', 'display Oddshot', 'showImages', 'display_oddshot');
			await Migrators.moveOption('showImages', 'display Miiverse', 'showImages', 'display_miiverse');
			await Migrators.moveOption('showImages', 'display swirl', 'showImages', 'display_swirl');
		},
	}, {
		versionNumber: '4.7.1-changeDefaultImageMaxSizeRetry',
		async go() {
			await Migrators.updateOption('showImages', 'maxWidth', 640, '100%');
			await Migrators.updateOption('showImages', 'maxHeight', 480, '80%');
			await Migrators.updateOption('showImages', 'maxWidth', '640', '100%');
			await Migrators.updateOption('showImages', 'maxHeight', '480', '80%');
		},
	}, {
		versionNumber: '4.7.4-galleryFilmstripGranularity',
		async go() {
			await Migrators.moveOption('showImages', 'dontLoadAlbumsBiggerThan', 'showImages', 'filmstripLoadIncrement');
		},
	}, {
		versionNumber: '4.7.8-ner-hide-dupes',
		async go() {
			await Migrators.updateOption('neverEndingReddit', 'hideDupes', 'fade', 'hide');
		},
	}, {
		versionNumber: '5.0.1-disable-redditmedia-lookup',
		async go() {
			await Migrators.forceUpdateOption('showImages', 'expandoCommentRedirects', 'nothing');
		},
	}, {
		versionNumber: '5.0.2-reenable-redditmedia-expando',
		async go() {
			await Migrators.updateOption('showImages', 'expandoCommentRedirects', 'nothing', 'expando');
		},
	}, {
		versionNumber: '5.1.1-remove-multiredditnavbar-sectionlinks-workaround',
		async go() {
			await Migrators.forceUpdateOption('multiredditNavbar', 'sectionLinks', sectionLinks => {
				if (!sectionLinks) return;
				for (const row of sectionLinks) {
					row[1] = row[1].replace(/^\.\.\//, './');
				}
			});
		},
	}, {
		versionNumber: '5.3.1-enable-hardIgnore',
		async go() {
			await Migrators.forceUpdateOption('userTagger', 'hardIgnore', true);
		},
	}, {
		versionNumber: '5.3.5-remove-updates-css',
		async go() {
			await Migrators.forceUpdateOption('stylesheet', 'loadStylesheets', rows =>
				rows && rows.filter(row => row[0] !== 'https://cdn.redditenhancementsuite.com/updates.css')
			);

			const hideFloatingPauseButton = 'res-neverEndingReddit-hideFloatingPauseButton';
			await Migrators.moveOption('stylesheet', 'bodyClasses', 'neverEndingReddit', 'showPauseButton', rows =>
				!!rows && rows.every(row => row[0] !== hideFloatingPauseButton)
			);
			await Migrators.forceUpdateOption('stylesheet', 'bodyClasses', rows =>
				rows && rows.filter(row => row[0] !== hideFloatingPauseButton)
			);

			let shouldHideTagline = false;
			await Migrators.forceUpdateOption('stylesheet', 'bodyClasses', rows => {
				if (!rows) return [];
				const filteredRows = rows.filter(row => row[0] !== 'res-hide-tagline-frontpage');
				shouldHideTagline = filteredRows.length < rows.length;
				return filteredRows;
			});
			if (shouldHideTagline) {
				Migrators.forceUpdateOption('stylesheet', 'snippets', rows => [
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
			await Migrators.forceUpdateOption('styleTweaks', 'hideUnvotable', true);
		},
	}, {
		versionNumber: '5.3.7-automaticNightMode-to-enum',
		async go() {
			await Migrators.forceUpdateOption('nightMode', 'automaticNightMode', value => (value === true) ? 'user' : 'none');
		},
	}, {
		versionNumber: '5.5.0-commentLinks-rename',
		async go() {
			await Migrators.moveOption('keyboardNav', 'commentsLinkNumbers', 'keyboardNav', 'linkNumbers');
			await Migrators.moveOption('keyboardNav', 'commentsLinkNumberPosition', 'keyboardNav', 'linkNumberPosition');
			await Migrators.moveOption('keyboardNav', 'commentsLinkToggleExpando', 'keyboardNav', 'linkToggleExpando');
			await Migrators.moveOption('keyboardNav', 'commentsLinkNewTab', 'keyboardNav', 'linkNewTab');
		},
	}, {
		versionNumber: '5.5.1-maxSize-to-string',
		async go() {
			const toString = x => (x ? String(x) : '');
			await Migrators.forceUpdateOption('showImages', 'maxWidth', toString);
			await Migrators.forceUpdateOption('showImages', 'maxHeight', toString);
		},
	}, {
		versionNumber: '5.5.3-disable-userbarHider',
		async go() {
			const notificationsOptions = await Options.loadRaw('notifications');
			if (!notificationsOptions ||
				!notificationsOptions.notificationTypes ||
				!notificationsOptions.notificationTypes.value ||
				!notificationsOptions.notificationTypes.value.some(([modId, notificationId]) => modId === 'userbarHider' && notificationId === 'userbarState')) {
				// user has never toggled userbarHider, disable it
				Modules.setEnabled('userbarHider', false);
			}
		},
	}, {
		versionNumber: '5.5.11-update-notifications',
		async go() {
			await Migrators.updateOption('onboarding', 'updateNotification', 'releaseNotes', 'notification');
		},
	}, {
		versionNumber: '5.6.1-shard-tags',
		async go() {
			const tags = await Storage.get('RESmodules.userTagger.tags') || {};
			const remappedTags = _.mapKeys(tags, (v, k) => `tag.${k.toLowerCase()}`);
			await Storage.setMultiple(remappedTags);
		},
	}, {
		versionNumber: '5.6.2-remove-old-tags',
		async go() {
			await Storage.delete('RESmodules.userTagger.tags');
		},
	},

];  // ^^ Add new migrations ^^

export async function migrate() {
	await forEachSeq(await getMigrationsToRun(), async currentMigration => {
		await currentMigration.go();
		// Checkpoint, in case the next migration crashes
		setLastMigratedVersion(currentMigration.versionNumber);
	});

	// Set the migrated version to the current latest migration,
	// in case the above loop didn't run (i.e. on first install)
	setLastMigratedVersion(_.last(migrations).versionNumber);
}

async function getMigrationsToRun() {
	const lastMigratedVersion = await getLastMigratedVersion();

	// false specifically; we want to run all migrations on `null`
	if (lastMigratedVersion === false) return [];

	return _.takeRightWhile(migrations, ({ versionNumber }) => versionNumber !== lastMigratedVersion);
}

// Returns a string like "4.5.0.1" (the last migration run),
// null (run all migrations), or false (do not run migrations)
async function getLastMigratedVersion(): Promise<string | null | false> {
	const RESOptionsVersion = await Storage.get('RESOptionsVersion');

	if (typeof RESOptionsVersion === 'undefined') {
		// Error occured sometime in the past, abort
		console.warn('RESOptionsVersion was undefined');
		return false;
	} else if (RESOptionsVersion !== null) {
		// Migration has run before; verify/sanitize the version number
		if (/^\d$/.test(RESOptionsVersion)) {
			// Legacy format: integer number
			const legacyOptionVersionMapping = ['4.5.0.0', '4.5.0.1'];
			return legacyOptionVersionMapping[RESOptionsVersion - 1];
		} else if (!migrations.map(m => m.versionNumber).includes(RESOptionsVersion)) {
			// Abort, abort! Probably downgraded
			console.warn(`Couldn't find a migration matching RESOptionsVersion = ${RESOptionsVersion}`);
			return false;
		} else {
			// RESOptionsVersion is a valid migration version number
			return RESOptionsVersion;
		}
	} else if (await Storage.has('RES.firstRun.4.5.0.2')) {
		// 4.5.0.2 bug: RESOptionsVersion was not set on fresh installs.
		return '4.5.0.2';
	} else if (
		await Storage.has('RES.firstRun.4.3.2.1') ||
		await Storage.has('RES.firstRun.4.3.1.2') ||
		await Storage.has('RES.firstRun.4.3.0.3') ||
		await Storage.has('RES.firstRun.4.2.0.2') ||
		await Storage.has('RES.firstRun.4.1.5')
	) {
		// Upgraded from old version to a version which supports migrations; run all migrations
		return null;
	} else {
		// New install, no migrations necessary
		return false;
	}
}

function setLastMigratedVersion(value) {
	if (value) {
		Storage.set('RESOptionsVersion', value);
	}
}
