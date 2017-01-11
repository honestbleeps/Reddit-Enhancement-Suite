/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Init from '../core/init';
import * as Options from '../core/options';
import {
	BodyClasses,
	Thing,
	asyncSome,
	currentDomain,
	currentSubreddit,
	CreateElement,
	fastAsync,
	filterMap,
	loggedInUser,
	indexOptionTable,
	isCurrentMultireddit,
	isCurrentSubreddit,
	isPageType,
	mutex,
	reifyPromise,
	watchForElement,
} from '../utils';
import { Storage, ajax } from '../environment';
import * as CommandLine from './commandLine';
import * as Menu from './menu';
import * as Notifications from './notifications';
import * as SelectedEntry from './selectedEntry';
import * as SettingsNavigation from './settingsNavigation';
import ExternalFilter from './filteReddit/ExternalFilter';
import Filterline from './filteReddit/Filterline';
import browseContexts from './filteReddit/browseContexts';
import postCases from './filteReddit/postCases';

export const module: Module<*> = new Module('filteReddit');

module.moduleName = 'filteRedditName';
module.category = 'subredditsCategory';
module.description = 'filteRedditDesc';
module.keywords = ['filterreddit'];
module.options = {
	// any configurable options you have go here...
	// options must have a type and a value..
	// valid types are: text, boolean (if boolean, value must be true or false)
	// for example:
	NSFWfilter: {
		type: 'boolean',
		value: false,
		description: 'filteRedditNSFWfilterDesc',
		title: 'filteRedditNSFWfilterTitle',
	},
	NSFWQuickToggle: {
		type: 'boolean',
		value: true,
		description: 'filteRedditNSFWQuickToggleDesc',
		title: 'filteRedditNSFWQuickToggleTitle',
		advanced: true,
	},
	showFilterline: {
		type: 'boolean',
		value: false,
		description: 'filteRedditShowFilterlineDesc',
		title: 'filteRedditShowFilterlineTitle',
		bodyClass: true,
	},
	excludeOwnPosts: {
		type: 'boolean',
		value: true,
		description: 'filteRedditExcludeOwnPostsDesc',
		title: 'filteRedditExcludeOwnPostsTitle',
	},
	excludeCommentsPage: {
		type: 'boolean',
		value: true,
		description: 'filteRedditExcludeCommentsPageDesc',
		title: 'filteRedditExcludeCommentsPageTitle',
	},
	excludeModqueue: {
		type: 'boolean',
		value: true,
		description: 'filteRedditExcludeModqueueDesc',
		title: 'filteRedditExcludeModqueueTitle',
	},
	excludeUserPages: {
		type: 'boolean',
		value: false,
		description: 'filteRedditExcludeUserPagesDesc',
		title: 'filteRedditExcludeUserPagesTitle',
	},
	regexpFilters: {
		type: 'boolean',
		value: true,
		advanced: true,
		description: `
			Allow RegExp in certain filteReddit fields.
			<br>If you have filters which start with <code>/</code> and don't know what RegExp is, you should turn this option off.
			<br>Find out more on the <a href="/r/Enhancement/wiki/index/filters/filtereddit/regexp">/r/Enhancement wiki</a>.
		`,
		title: 'filteRedditRegexpFiltersTitle',
	},
	keywords: {
		type: 'table',
		addRowText: '+add filter',
		fields: [{
			key: 'keyword',
			name: 'keyword',
			type: 'text',
		}, {
			key: 'applyTo',
			name: 'applyTo',
			type: 'enum',
			values: [{
				name: 'Everywhere',
				value: 'everywhere',
			}, {
				name: 'Everywhere but:',
				value: 'exclude',
			}, {
				name: 'Only on:',
				value: 'include',
			}],
			value: 'everywhere',
		}, {
			key: 'subreddits',
			name: 'subreddits',
			type: 'list',
			listType: 'subreddits',
		}, {
			key: 'unlessKeyword',
			name: 'unlessKeyword',
			type: 'text',
		}],
		value: [],
		description: `
			Hide posts with certain keywords in the title.
			\n\n<br><br>RegExp like <code>/(this|that|theother)/i</code> is allowed for keyword (but not unlessKeyword).
			\n\n<br>Find out more on the <a href="/r/Enhancement/wiki/index/filters/filtereddit/regexp">/r/Enhancement wiki</a>.
		`,
		title: 'filteRedditKeywordsTitle',
	},
	subreddits: {
		type: 'table',
		addRowText: '+add filter',
		fields: [{
			key: 'subreddit',
			name: 'subreddit',
			type: 'text',
		}],
		value: [],
		description: `
			Hide posts submitted to certain subreddits.
			\n\n<br><br>RegExp like <code>/(this|that|theother)/i</code> is allowed for subreddit.
			\n\n<br>Find out more on the <a href="/r/Enhancement/wiki/index/filters/filtereddit/regexp">/r/Enhancement wiki</a>.
		`,
		title: 'filteRedditSubredditsTitle',
		onChange() {
			if (module.options.useRedditFilters.value) {
				reconcileNativeFilters();
			}
		},
	},
	filterSubredditsFrom: {
		type: 'enum',
		value: 'everywhere-except-subreddit',
		values: [{
			name: 'Everywhere except inside a subreddit',
			value: 'everywhere-except-subreddit',
		}, {
			name: 'Everywhere',
			value: 'everywhere',
		}, {
			name: '/r/all and domain pages',
			value: 'legacy',
		}],
		description: 'filteRedditFilterSubredditsFromDesc',
		title: 'filteRedditFilterSubredditsFromTitle',
	},
	useRedditFilters: {
		type: 'boolean',
		value: false,
		description: 'filteRedditUseRedditFiltersDesc',
		title: 'filteRedditUseRedditFiltersTitle',
		onChange() {
			if (module.options.useRedditFilters.value) {
				reconcileNativeFilters();
			}
		},
	},
	forceSyncFilters: {
		type: 'button',
		text: 'sync',
		description: 'filteRedditForceSyncFiltersDesc',
		title: 'filteRedditForceSyncFiltersTitle',
		callback() {
			reconcileNativeFilters({ warnNotLoggedIn: true });
		},
	},
	domains: {
		type: 'table',
		addRowText: '+add filter',
		fields: [{
			key: 'keyword',
			name: 'keyword',
			type: 'text',
		}, {
			key: 'applyTo',
			name: 'applyTo',
			type: 'enum',
			values: [{
				name: 'Everywhere',
				value: 'everywhere',
			}, {
				name: 'Everywhere but:',
				value: 'exclude',
			}, {
				name: 'Only on:',
				value: 'include',
			}],
			value: 'everywhere',
		}, {
			key: 'subreddits',
			name: 'subreddits',
			type: 'list',
			listType: 'subreddits',
		}],
		value: [],
		description: `
			Hide posts that link to certain domains.
			\n\n<br><br>Caution: domain keywords like "reddit" would ignore "reddit.com" and "fooredditbar.com".
			\n\n<br><br>RegExp like <code>/(this|that|theother)/i</code> is allowed for domain.
			\n\n<br>Find out more on the <a href="/r/Enhancement/wiki/index/filters/filtereddit/regexp">/r/Enhancement wiki</a>.
		`,
		title: 'filteRedditDomainsTitle',
	},
	flair: {
		type: 'table',
		addRowText: '+add filter',
		fields: [{
			key: 'keyword',
			name: 'keyword',
			type: 'text',
		}, {
			key: 'applyTo',
			name: 'applyTo',
			type: 'enum',
			values: [{
				name: 'Everywhere',
				value: 'everywhere',
			}, {
				name: 'Everywhere but:',
				value: 'exclude',
			}, {
				name: 'Only on:',
				value: 'include',
			}],
			value: 'everywhere',
		}, {
			key: 'subreddits',
			name: 'subreddits',
			type: 'list',
			listType: 'subreddits',
		}],
		value: [],
		description: `
			Hide in posts where certain keywords are in the post's link flair
			\n\n<br><br>RegExp like <code>/(this|that|theother)/i</code> is allowed for flair.
			\n\n<br>Find out more on the <a href="/r/Enhancement/wiki/index/filters/filtereddit/regexp">/r/Enhancement wiki</a>.
		`,
		title: 'filteRedditFlairTitle',
	},
	allowNSFW: {
		type: 'table',
		addRowText: '+add subreddits',
		description: 'filteRedditAllowNSFWDesc',
		title: 'filteRedditAllowNSFWTitle',
		fields: [{
			key: 'subreddits',
			name: 'subreddits',
			type: 'list',
			listType: 'subreddits',
		}, {
			key: 'where',
			name: 'where',
			type: 'enum',
			values: [{
				name: 'Everywhere',
				value: 'everywhere',
			}, {
				name: 'When browsing subreddit/multi-subreddit',
				value: 'visit',
			}],
			value: 'everywhere',
		}],
		value: ([]: Array<[string, 'everywhere' | 'visit']>),
	},
	customFilters: {
		type: 'builder',
		advanced: true, // VERY
		description: 'Hide posts based on complex custom criteria. <p>This is a very advanced feature, please <a href="http://www.reddit.com/r/Enhancement/wiki/customfilters">read the guide</a> before asking questions.  <p style="font-weight: bold; font-size: 16pt;">This feature is currently in beta. Filters may break in future RES updates.</p>',
		title: 'filteRedditCustomFiltersTitle',
		value: [],
		addItemText: '+add custom filter',
		defaultTemplate() {
			return {
				note: '',
				ver: 1,
				body: { type: 'group', op: 'all', of: [/* empty */] },
			};
		},
		cases: {
			group: {
				name: 'Group of conditions',
				defaultTemplate(op, of) {
					return {
						type: 'group',
						op: (op || 'all'),
						of: (of || []),
					};
				},
				fields: [
					{ type: 'select', options: ['all', 'any', 'one', 'none'], id: 'op' },
					' of these are true:',
					{ type: 'multi', include: 'all', id: 'of' },
				],
				evaluate(thing, data, config) {
					if (data.op === 'all') {
						return data.of.every(condition => config[condition.type].evaluate(thing, condition, config));
					} else if (data.op === 'any') {
						return data.of.some(condition => config[condition.type].evaluate(thing, condition, config));
					} else if (data.op === 'one') {
						let seenTrue = false;
						for (const condition of data.of) {
							const result = config[condition.type].evaluate(thing, condition, config);
							if (result) {
								if (seenTrue) return false;
								seenTrue = true;
							}
						}
						return seenTrue;
					} else if (data.op === 'none') {
						return data.of.every(condition => !config[condition.type].evaluate(thing, condition, config));
					} else {
						throw new RangeError(`Illegal group operator: "${data.op}"`);
					}
				},
			},
			..._.pickBy(postCases, (v: *): * => !v.async), // customFilters doesn't support async yet
			...browseContexts,
		},
	},
};

module.include = [
	'linklist',
	'modqueue',
	'profile',
	'comments',
	'search',
];
module.exclude = [
	/^\/over18\b/i,
];

module.shouldRun = () => !(
	module.options.excludeModqueue.value && isPageType('modqueue') ||
	module.options.excludeUserPages.value && isPageType('profile') ||
	module.options.excludeCommentsPage.value && isPageType('comments')
);

const pageID = browseContexts.currentLocation.getCurrent();
const filterlineStorage = Storage.wrap(`RESmodules.filteReddit.${pageID}`, (null: null | *));
const filterlineVisibilityStorage = Storage.wrap(`RESmodules.filteReddit.filterlineVisibility.${pageID}`, (false: boolean));

const initialFilterlineState = _.once(() => reifyPromise(filterlineStorage.get()));
const initialFilterlineVisibility = _.once(() => reifyPromise(asyncSome([
	filterlineVisibilityStorage.get(),
	Init.loadOptions.then(() => module.options.showFilterline.value),
], x => x)));

module.loadDynamicOptions = () => {
	// Initiate async load now so state will be restored asap
	initialFilterlineState();
	initialFilterlineVisibility();
};

module.beforeLoad = async () => {
	updateNsfwBodyClass(module.options.NSFWfilter.value);

	// start initializing filterline early
	createFilterline();

	if (await initialFilterlineVisibility().get()) {
		// Pad the space where the filterline will be shown, so that it won't push `siteTable` down when initialized
		BodyClasses.add('res-filteReddit-filterline-pad-until-ready');
	}
};

const $nsfwSwitch = _.once(() => $(CreateElement.toggleButton(undefined, 'nsfwSwitchToggle', module.options.NSFWfilter.value)));

module.go = () => {
	registerNsfwToggleCommand();
	if (module.options.NSFWQuickToggle.value) {
		Menu.addMenuItem($('<div>', {
			text: 'nsfw filter',
			title: 'Toggle NSFW Filter',
			append: $nsfwSwitch(),
		}), toggleNsfwFilter);
	}

	createFilterline().go();

	function scanEntries(ele) {
		const newThings = Thing.things(ele).filter(v => v.isPost());
		for (const thing of newThings) {
			updateNsfwThingClass(thing);

			if (
				module.options.excludeOwnPosts.value &&
				loggedInUser() && loggedInUser() === thing.getAuthor()
			) continue;

			createFilterline().filterline.addThing(thing);
		}
	}

	scanEntries();
	watchForElement('siteTable', scanEntries);

	registerSubredditFilterCommand();
};

const createFilterline = _.once(() => {
	const filterline = new Filterline();

	function buildBasicFilter(key, customFilterType) {
		return {
			key,
			evaluate(thing) {
				const filters = getStringMatchFilters(key, customFilterType);
				return executeFilters(thing, filters);
			},
			clearCache() { getStringMatchFilters.cache.delete(key); },
		};
	}

	const externalFilters = [
		buildBasicFilter('keywords', 'postTitle'),
		buildBasicFilter('domains', 'domain'),
		{
			...buildBasicFilter('subreddits', 'subreddit'),
			state: (
				module.options.filterSubredditsFrom.value === 'everywhere' ||
				module.options.filterSubredditsFrom.value === 'everywhere-except-subreddit' && !currentSubreddit() ||
				isCurrentSubreddit('all') ||
				currentDomain() ||
				isCurrentMultireddit('me/f/all')
			) ? false : null,
		},
		buildBasicFilter('flair', 'linkFlair'),
		{
			key: 'customFilters',
			evaluate(thing) {
				return executeFilters(thing, module.options.customFilters.value);
			},
		},
	];

	for (const options of externalFilters) {
		filterline.addFilter(new ExternalFilter({
			state: (false: boolean | null), // Hide all that matches
			parent: filterline,
			settingsHtml: SettingsNavigation.makeUrlHashLink(module.moduleID, options.key, ' ', 'gearIcon'),
			...options,
		}));
	}

	for (const [key, options] of Object.entries(postCases)) {
		if (options.disabled) continue;

		filterline.addChoice({
			key,
			filterlineStorage,
			...options,
		});
		if (options.alwaysShow) filterline.createFilterFromKey(key, { add: true, id: key });
	}

	const go = fastAsync(function*() {
		let visible = yield initialFilterlineVisibility().get();

		const filterlineTab = CreateElement.tabMenuItem({
			text: '',
			title: 'Toggle filterline',
			className: 'res-toggle-filterline-visibility',
			checked: visible,
		});

		filterlineTab.addEventListener('change', ({ detail: newVisibilityState }: any) => {
			toggleVisibility(newVisibilityState);
		});

		// When using the command line, show the filterline
		filterline.enableCommandLineInterface(() => { if (!visible) filterlineTab.click(); });

		const completeFilterline = _.once(fastAsync(function*() {
			const state = yield initialFilterlineState().get();
			if (state) filterline.restoreState(state);
			filterline.createElement();
			BodyClasses.remove('res-filteReddit-filterline-pad-until-ready');
		}));

		function toggleVisibility(newVisibilityState) {
			if (newVisibilityState) {
				completeFilterline();
				filterlineTab.removeAttribute('aftercontent');
			} else if (filterline.getActiveFilters().find(v => !(v instanceof ExternalFilter))) {
				filterlineTab.setAttribute('aftercontent', ' (active)');
			}

			BodyClasses.toggle(newVisibilityState, 'res-filteReddit-show-filterline');

			if (visible !== newVisibilityState) {
				filterlineVisibilityStorage.set(newVisibilityState);
				visible = newVisibilityState;
			}
		}

		if (visible) {
			toggleVisibility(true);
		}
	});

	return { filterline, go };
});

function updateNsfwThingClass(thing) {
	if (thing.isNSFW()) {
		if (allowNSFW(thing.getSubreddit(), currentSubreddit())) {
			thing.element.classList.add('allowOver18');
		} else if (module.options.NSFWfilter.value) {
			if (!thing.element.classList.contains('over18')) {
				// backfill for new post layout
				thing.element.classList.add('over18');
			}
		}
	}
}

const regexRegex = /^\/(.*)\/([gim]+)?$/;
const getStringMatchFilters = _.memoize((type, customFilterType) =>
	filterMap(module.options[type].value, source => {
		// $FlowIssue
		const [matchString = '', applyTo = 'everywhere', applyList = '', except = ''] = Array.isArray(source) ? source : [source];

		let matcher, flags;
		if (module.options.regexpFilters.value && regexRegex.test(matchString)) {
			try {
				const [, str, fl] = (regexRegex.exec(matchString): any); // guaranteed to match due to `.test()` above
				const regexp = new RegExp(str, fl);
				matcher = regexp.source;
				flags = regexp.flags;
			} catch (e) {
				Notifications.showNotification({
					moduleID: module.moduleID,
					optionKey: type,
					notificationID: 'badRegexpPattern',
					header: 'filteReddit RegExp issue',
					message: `
						There was a problem parsing a RegExp in your filteReddit settings.
						${SettingsNavigation.makeUrlHashLink(module.moduleID, type, 'Correct it now.')}
						<p>RegExp: <code>${matchString}</code></p>
						<blockquote>${e.toString()}</blockquote>
					`,
				});
				return;
			}
		} else {
			matcher = matchString.toLowerCase();

			// flair and domains filters match if contains and the related postCases do a full match (^$) regexp
			if (type === 'flair' || type === 'domains') matcher = `.*${matcher}.*`;
		}

		const filter = {
			type: 'group',
			op: 'all',
			of: [],
		};

		// add any necessary applyTo filtering
		if (applyTo !== 'everywhere') {
			filter.of.push({
				type: 'group',
				op: applyTo === 'exclude' ? 'none' : 'any',
				of: applyList.split(',').map(sr => ({
					type: 'currentSub',
					patt: sr,
				})),
			});
		}

		filter.of.push({
			type: customFilterType,
			patt: matcher,
			flags,
		});

		if (except && except.length) {
			filter.of.push({
				type: 'group',
				op: 'none',
				of: [{
					type: customFilterType,
					patt: except,
				}],
			});
		}

		return [{
			body: filter,
			note: `basic ${type} filter transformation`,
			source,
			ver: 1,
		}];
	})
);

function executeFilters(thing, filters) {
	const config = module.options.customFilters.cases;
	const filter = filters.find(filter => config[filter.body.type].evaluate(thing, filter.body, config));
	return filter && (filter.source || filter);
}

/**
 * @param {string} subreddit
 * @returns {boolean} Whether the subreddit was added (true) or removed (false) from the filter list.
 */
export function toggleFilter(subreddit: string): boolean {
	subreddit = subreddit.toLowerCase();

	const filteredReddits = module.options.subreddits.value || [];
	const subredditIndex = filteredReddits.findIndex(reddit => reddit && reddit[0].toLowerCase() === subreddit);

	let message;
	if (subredditIndex !== -1) {
		filteredReddits.splice(subredditIndex, 1);
		message = `No longer filtering submissions from /r/${subreddit}.`;
	} else {
		filteredReddits.push([subreddit, 'everywhere', '']);
		message = `Submissions from /r/${subreddit} will be hidden from listings.`;
	}

	Notifications.showNotification({
		moduleID: 'filteReddit',
		notificationID: 'filterSubreddit',
		message,
	});

	Options.set(module, 'subreddits', filteredReddits);

	return (subredditIndex === -1);
}

const reconcileNativeFilters = mutex(async ({ warnNotLoggedIn = false }: { warnNotLoggedIn?: boolean } = {}) => {
	const user = loggedInUser();

	if (!user) {
		if (warnNotLoggedIn) {
			Notifications.showNotification({
				moduleID: module.moduleID,
				notificationID: 'filterSyncNotLoggedIn',
				header: 'Filters not synced',
				message: 'You must log in to sync filters.',
			});
		}
		console.warn('Not syncing filters, not logged in...');
		return;
	}

	const { data: { subreddits } } = await ajax({
		url: `/api/filter/user/${user}/f/all`,
		type: 'json',
	});

	const existing = subreddits.map(({ name }) => name.toLowerCase());

	const desired = module.options.subreddits.value
		.map(([sr]) => sr)
		.filter(sr => !regexRegex.test(sr))
		.map(name => name.toLowerCase())
		.slice(0, 100);

	const toRemove = _.difference(existing, desired).length;
	const toAdd = _.difference(desired, existing).length;

	if (!toRemove && !toAdd) {
		Notifications.showNotification({
			moduleID: module.moduleID,
			optionKey: 'useRedditFilters',
			notificationID: 'filterSyncNoneAddedOrRemoved',
			closeDelay: 5000,
			header: 'No filters synced',
			message: `
				Either no subreddit filters were changed, or you have more than 100 subreddits filtered.
				Reddit's native /r/all filtering is limited to 100 subreddits.
			`,
		});
		return;
	}

	try {
		// when `model` is provided, this replaces all subreddits
		await ajax({
			method: 'PUT',
			url: `/api/filter/user/${user}/f/all`,
			data: {
				model: JSON.stringify({
					subreddits: desired.map(name => ({ name })),
				}),
			},
		});
	} catch (e) {
		console.error(e);
		Notifications.showNotification({
			moduleID: module.moduleID,
			optionKey: 'useRedditFilters',
			notificationID: 'filterSyncError',
			header: 'Error syncing filters',
			message: `Filters could not be synced: ${e}`,
		});
		return;
	}

	Notifications.showNotification({
		moduleID: module.moduleID,
		optionKey: 'useRedditFilters',
		notificationID: 'filterSyncSuccess',
		header: 'Successfully synced filters',
		message: `Removed ${toRemove} and added ${toAdd} filters.`,
	});
});

const subredditAllowNsfwOption = _.once(() => indexOptionTable(module.options.allowNSFW, 0));

const allowAllNsfw = _.memoize(subreddit => {
	const currOptionValue = subredditAllowNsfwOption()[subreddit.toLowerCase()];
	return currOptionValue && currOptionValue[0][1] === 'visit';
});

function allowNSFW(postSubreddit, currSubreddit = currentSubreddit()) {
	if (!module.options.allowNSFW.value || !module.options.allowNSFW.value.length) return false;

	if (currSubreddit && allowAllNsfw(currSubreddit)) {
		return true;
	}

	if (!postSubreddit) postSubreddit = currSubreddit;
	if (!postSubreddit) return false;
	const postOptionValue = subredditAllowNsfwOption()[postSubreddit.toLowerCase()];
	if (postOptionValue) {
		if (postOptionValue[0][1] === 'everywhere') {
			return true;
		} else { // optionValue[1] == visit (subreddit or multisubreddit)
			return (currSubreddit || '').split('+').includes(postSubreddit);
		}
	}
	return false;
}

function toggleNsfwFilter(toggle, notify) {
	if (toggle === false || module.options.NSFWfilter.value) {
		updateNsfwBodyClass(false);
		Options.set(module, 'NSFWfilter', false);
		$nsfwSwitch().removeClass('enabled');
	} else {
		updateNsfwBodyClass(true);
		Options.set(module, 'NSFWfilter', true);
		$nsfwSwitch().addClass('enabled');
	}

	if (notify) {
		const onOff = module.options.NSFWfilter.value ? 'on' : ' off';

		Notifications.showNotification({
			header: 'NSFW Filter',
			moduleID: 'filteReddit',
			optionKey: 'NSFWfilter',
			message: `NSFW Filter has been turned ${onOff}.`,
		}, 4000);
	}
}

function updateNsfwBodyClass(filterOn) {
	BodyClasses.toggle(filterOn, 'hideOver18');
}

function registerNsfwToggleCommand() {
	CommandLine.registerCommand('nsfw', 'nsfw [on|off] - toggle nsfw filter on/off',
		() => 'Toggle nsfw filter on or off',
		(command, val) => {
			let toggle;
			switch (val && val.toLowerCase()) {
				case 'on':
					toggle = true;
					break;
				case 'off':
					toggle = false;
					break;
				default:
					return 'nsfw on &nbsp; or &nbsp; nsfw off ?';
			}
			toggleNsfwFilter(toggle, true);
		}
	);
}

function registerSubredditFilterCommand() {
	const getSubreddit = val => (
		val ||
		SelectedEntry.selectedThing() && SelectedEntry.selectedThing().getSubreddit() ||
		currentSubreddit() ||
		''
	);

	CommandLine.registerCommand(/^f(?:ilter)?/, 'f[ilter] [subreddit] - toggle subreddit filter',
		(cmd, val) => {
			const subreddit = getSubreddit(val);
			return `toggle subreddit filter for: ${subreddit}`;
		},
		(cmd, val) => {
			const subreddit = getSubreddit(val);
			if (!subreddit) return 'no subreddit specified or post selected';
			toggleFilter(subreddit);
		}
	);
}
