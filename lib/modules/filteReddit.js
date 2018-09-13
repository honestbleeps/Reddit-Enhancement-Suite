/* @flow */

import _ from 'lodash';
import { markdown } from 'snudown-js';
import { flow, filter, map, mapValues, keyBy, slice } from 'lodash/fp';
import { Module } from '../core/module';
import * as Options from '../core/options';
import {
	BodyClasses,
	asyncFind,
	asyncFlow,
	batch,
	currentDomain,
	currentSubreddit,
	currentUserProfile,
	fullLocation,
	CreateElement,
	extendDeep,
	fastAsync,
	loggedInUser,
	indexOptionTable,
	isCurrentMultireddit,
	isCurrentSubreddit,
	isPageType,
	mutex,
	reifyPromise,
	watchForThings,
	scrollToElement,
} from '../utils';
import { Storage, ajax, i18n } from '../environment';
import type { BuilderRootValue } from '../core/module';
import type { RedditListing, RedditLink } from '../types/reddit';
import * as CommandLine from './commandLine';
import * as CustomToggles from './customToggles';
import * as Notifications from './notifications';
import * as RESTips from './RESTips';
import * as SelectedEntry from './selectedEntry';
import * as Cases from './filteReddit/cases';
import { Case } from './filteReddit/Case';
import { Filterline } from './filteReddit/Filterline';
import { ExternalFilter } from './filteReddit/ExternalFilter';

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
	keywords: {
		type: 'table',
		addRowText: 'filteRedditAddFilter',
		fields: [{
			key: 'keyword',
			name: 'filteRedditKeyword',
			type: 'text',
		}, {
			key: 'applyTo',
			name: 'filteRedditApplyTo',
			type: 'enum',
			values: [{
				name: 'filteRedditEverywhere',
				value: 'everywhere',
			}, {
				name: 'filteRedditEverywhereBut',
				value: 'exclude',
			}, {
				name: 'filteRedditOnlyOn',
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
		description: 'filteRedditKeywordsDesc',
		title: 'filteRedditKeywordsTitle',
	},
	subreddits: {
		type: 'table',
		addRowText: 'filteRedditAddFilter',
		fields: [{
			key: 'subreddit',
			name: 'filteRedditSubredditsSubreddits',
			type: 'text',
		}],
		value: [],
		description: 'filteRedditSubredditsDesc',
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
			name: 'filteRedditFilterSubredditsEverywhereButSubreddit',
			value: 'everywhere-except-subreddit',
		}, {
			name: 'filteRedditEverywhere',
			value: 'everywhere',
		}, {
			name: 'filteRedditFilterSubredditsAllPopularAndDomain',
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
		text: 'filteRedditForceSyncFiltersLabel',
		description: 'filteRedditForceSyncFiltersDesc',
		title: 'filteRedditForceSyncFiltersTitle',
		callback() {
			reconcileNativeFilters({ warnNotLoggedIn: true });
		},
	},
	domains: {
		type: 'table',
		addRowText: 'filteRedditAddFilter',
		fields: [{
			key: 'keyword',
			name: 'filteRedditKeyword',
			type: 'text',
		}, {
			key: 'applyTo',
			name: 'filteRedditApplyTo',
			type: 'enum',
			values: [{
				name: 'filteRedditEverywhere',
				value: 'everywhere',
			}, {
				name: 'filteRedditEverywhereBut',
				value: 'exclude',
			}, {
				name: 'filteRedditOnlyOn',
				value: 'include',
			}],
			value: 'everywhere',
		}, {
			key: 'subreddits',
			name: 'filteRedditSubreddits',
			type: 'list',
			listType: 'subreddits',
		}],
		value: [],
		description: 'filteRedditDomainsDesc',
		title: 'filteRedditDomainsTitle',
	},
	flair: {
		type: 'table',
		addRowText: 'filteRedditAddFilter',
		fields: [{
			key: 'keyword',
			name: 'filteRedditKeyword',
			type: 'text',
		}, {
			key: 'applyTo',
			name: 'filteRedditApplyTo',
			type: 'enum',
			values: [{
				name: 'filteRedditEverywhere',
				value: 'everywhere',
			}, {
				name: 'filteRedditEverywhereBut',
				value: 'exclude',
			}, {
				name: 'filteRedditOnlyOn',
				value: 'include',
			}],
			value: 'everywhere',
		}, {
			key: 'subreddits',
			name: 'filteRedditSubreddits',
			type: 'list',
			listType: 'subreddits',
		}],
		value: [],
		description: 'filteRedditFlairDesc',
		title: 'filteRedditFlairTitle',
	},
	allowNSFW: {
		type: 'table',
		addRowText: 'filteRedditAddSubreddits',
		description: 'filteRedditAllowNSFWDesc',
		title: 'filteRedditAllowNSFWTitle',
		fields: [{
			key: 'subreddits',
			name: 'filteRedditSubreddits',
			type: 'list',
			listType: 'subreddits',
		}, {
			key: 'where',
			name: 'filteRedditAllowNSFWWhere',
			type: 'enum',
			values: [{
				name: 'filteRedditEverywhere',
				value: 'everywhere',
			}, {
				name: 'filteRedditAllowNSFWWhenBrowsingSubreddit',
				value: 'visit',
			}],
			value: 'everywhere',
		}],
		value: ([]: Array<[string, 'everywhere' | 'visit']>),
	},
	customFiltersP: {
		type: 'builder',
		advanced: true, // VERY
		description: 'filteRedditCustomFiltersDesc',
		title: 'filteRedditCustomFiltersPTitle',
		value: [],
		addItemText: 'filteRedditAddCustomFilter',
		defaultTemplate() {
			return {
				note: '',
				ver: 3,
				body: Cases.getConditions('group'),
				id: `customFilter-${Date.now()}`,
				opts: {
					ondemand: false,
					name: '',
				},
			};
		},
		customOptionsFields: [
			[{ type: 'check', id: 'ondemand', label: 'Only filter when added to Filterline (on-demand)' }],
			['Filterline name: ', { type: 'text', id: 'name' }],
		],
		get cases() { Cases.populatePrimitives(); return { ...Cases.getByContext('post'), ...Cases.getByContext('browse') }; },
	},
	customFiltersC: {
		type: 'builder',
		advanced: true, // VERY
		description: 'filteRedditCustomFiltersDesc',
		title: 'filteRedditCustomFiltersCTitle',
		value: [],
		addItemText: 'filteRedditAddCustomFilter',
		defaultTemplate() {
			return {
				note: '',
				ver: 3,
				body: Cases.getConditions('group'),
				id: `customFilter-${Date.now()}`,
				opts: {
					ondemand: false,
					name: '',
					propagate: false,
				},
			};
		},
		customOptionsFields: [
			[{ type: 'check', id: 'ondemand', label: 'Only filter when added to Filterline (on-demand)' }],
			['Filterline name: ', { type: 'text', id: 'name' }],
			[{ type: 'check', id: 'propagate', label: 'Hide child commments' }],
		],
		get cases() { Cases.populatePrimitives(); return { ...Cases.getByContext('comment'), ...Cases.getByContext('browse') }; },
	},
};

module.include = [
	'linklist',
	'modqueue',
	'profile',
	'comments',
	'commentsLinklist',
	'search',
];
module.exclude = [
	/^\/over18\b/i,
];

module.shouldRun = () => !(
	module.options.excludeModqueue.value && isPageType('modqueue') ||
	module.options.excludeUserPages.value && isPageType('profile')
);

const featureTips = {
	filterline: {
		message: `
RES allows you to easily apply complex filters to post listings and comments. To toggle Filterline, click on the tab.
	`,
		title: 'Filterline',
		position: 6,
		quiet: true,
	},
	filterlineVisible: {
		// Wrap as to avoid loading markdown unnecessarily
		message: () => markdown(`
* Click once on a filter to enable it (e.g. clicking \`expando\` will only show posts with embedded media).
* Click again to only show posts which do not not match.
* A third click makes the filter inactive.
* To clear a filter, right-click on it.
* **Hover** on it to modify conditions, highlight or permanently hide all matches.

To find more filters and options, hover on icon to the left.

You can use the currently selected post as a basis for a new filter. To do this, click on **=** to the right of the filter name.

**Complex filter** creates filters which matches when \`none\`, \`one\`, \`any\`, or \`all\` of the subfilters matches. Click \`To on-demand\` to make these filters available on other pages.

**Use as default** lets you store the current filters to be used on other pages.

To see why a post is hidden, open dropdown and check **Show filter-reason**. This also gives you the opportunity to remove an external filter so that you don't have to look for it in the settings console.

You can use the command line to manipulate Filterline. Enter it by pressing the key \`f\`.
		`),
		title: 'Filterline — how to use it',
		position: 7,
		options: [{
			moduleID: 'filteReddit',
			key: 'showFilterline',
		}],
	},
};

export type FilterStorageValues = {|
	type: string,
	state: boolean | null,
	criterion?: string,
	name?: string,
	conditions?: {},
	sideEffects?: {},
|};

type LineState = {
	visible?: boolean,
	filters?: { [id: string]: FilterStorageValues },
};

const pageID = fullLocation();
const filterlineStorage = Storage.wrap(`filterline.${pageID}`, ({}: LineState));
const thingType = isPageType('comments', 'commentsLinklist') ? 'comment' : 'post';
const customFilterVariant = thingType === 'post' ? 'customFiltersP' : 'customFiltersC';

const createStateFromTypes = types => (
	types.reduce((acc, v, i) => {
		if (v) acc[`~${i}`] = { type: v, state: null };
		return acc;
	}, {})
);

// If filterlineStorage is empty, look for default filters
export const defaultFilters: Array<{| type: string, text: string, storage: * |}> = []; // Decreasing precedense
if (thingType === 'comment') {
	if (currentSubreddit()) {
		defaultFilters.push({
			type: 'subreddit',
			text: 'This subreddit',
			storage: Storage.wrap(`RESmodules.filteReddit.commentDefault-${String(currentSubreddit())}`, (null: null | *)),
		});
	}
	defaultFilters.push({
		type: 'everywhere',
		text: 'Everywhere',
		storage: Storage.wrap('RESmodules.filteReddit.commentDefault', createStateFromTypes([
			'hasExpando',
			'score',
			'isRead',
		])),
	});
} else if (thingType === 'post') {
	defaultFilters.push({
		type: 'everywhere',
		text: 'Everywhere',
		storage: Storage.wrap('RESmodules.filteReddit.postDefault', createStateFromTypes([
			'isNSFW',
			'isSpoiler',
			'isVisited',
			'commentsOpened',
			'hasExpando',
			'score',
		])),
	});
}

async function getDefaultFilters() {
	for (const { storage } of defaultFilters) {
		const filters = await storage.get(); // eslint-disable-line no-await-in-loop
		if (filters) return { filters };
	}
}

const initialFilterlineState = reifyPromise((async () => {
	const specific = await filterlineStorage.get();
	if (Object.keys(specific).length) return specific;
	return getDefaultFilters();
})());

let nsfwToggle;

module.beforeLoad = fastAsync(function*() {
	updateNsfwBodyClass(module.options.NSFWfilter.value);

	nsfwToggle = new CustomToggles.Toggle('nsfwMode', i18n('nsfwSwitchToggleText'), module.options.NSFWfilter.value);
	nsfwToggle.onToggle(() => { Options.set(module, 'NSFWfilter', nsfwToggle.enabled); });
	nsfwToggle.onStateChange(() => { updateNsfwBodyClass(nsfwToggle.enabled); });
	nsfwToggle.addCLI('nsfw');

	// start initializing filterline early
	createFilterline(yield initialFilterlineState.get());

	watchForThings(['post'], updateNsfwThingClass, { immediate: true });
	watchForThings([thingType], registerThing, { immediate: true });
});


module.go = () => {
	if (module.options.NSFWQuickToggle.value) {
		nsfwToggle.addMenuItem(i18n('nsfwSwitchToggleTitle'));
	}

	createFilterline().go();

	registerSubredditFilterCommand();
};

function registerThing(thing) {
	if (
		module.options.excludeOwnPosts.value && loggedInUser() &&
		currentUserProfile() !== loggedInUser() &&
		loggedInUser() === thing.getAuthor()
	) return;

	// Returns a promise which resolves when initial filtering is done
	return createFilterline().filterline.addThing(thing);
}

const createFilterline = _.once(({
	filters: storedFilters = {},
	visible: initialVisibility = module.options.showFilterline.value,
} = {}) => {
	Cases.populatePrimitives(['browse', thingType]);
	const filterline = new Filterline(filterlineStorage, thingType);

	const filters = {};

	function addExternalFilter(key, name, getConditions, Filter, source) {
		const cased = Cases.createAdHoc(key, name, getConditions, 'external', thingType, source);
		filters[key] = { Filter, type: cased.type, state: false };
	}

	const customFilters = _.groupBy(
		module.options[customFilterVariant].value,
		({ opts: { ondemand } = {} }) => ondemand ? 'ondemand' : 'always'
	);

	if (customFilters.ondemand) {
		customFilters.ondemand.forEach(v => addOndemandCase(v, true));
	}

	// Make customFilter(C|P) so that the settings link is available
	addExternalFilter(customFilterVariant, i18n(module.options[customFilterVariant].title), () => ({ type: 'false' }), ExternalFilter);

	for (const customFilter of (customFilters.always || [])) {
		const conditions = Cases.resolveGroup(customFilter.body);
		if (!Cases.isUseful(conditions.type)) continue;
		addExternalFilter(customFilter.id, (customFilter.opts || {}).name, () => conditions, ExternalFilter, customFilter);
	}

	function addListFilter(externalKey, caseType, additionalCriteria) {
		const list = module.options[externalKey].value;
		const sources = new Map();

		function getConditions() {
			sources.clear();
			return Cases.resolveGroup(Cases.getGroup('any', list.map(v => {
				const c = getStringMatchConditions(v, caseType, additionalCriteria);
				sources.set(c, v);
				return c;
			})));
		}

		const Filter = class ExternalFilterList extends ExternalFilter {
			async getMatchingEntry(thing) {
				return sources.get(
					await asyncFind(sources.keys(), v => Case.fromConditions(v).evaluate(thing))
				);
			}

			removeEntry(entry) {
				const newValueArray = _.pull(list, entry);
				Options.set(module, externalKey, newValueArray);
				this.update(this.state, null); // `null` in order to regenerate case from `getConditions`
			}
		};

		addExternalFilter(externalKey, i18n(module.options[externalKey].title), getConditions, Filter);
	}

	if (thingType === 'post') {
		addListFilter('keywords', 'postTitle');
		addListFilter('domains', 'domain', { fullMatch: false });
		if (
			module.options.filterSubredditsFrom.value === 'everywhere' ||
			module.options.filterSubredditsFrom.value === 'everywhere-except-subreddit' && !currentSubreddit() ||
			isCurrentSubreddit('all') || isCurrentSubreddit('popular') ||
			currentDomain() ||
			isCurrentMultireddit('me/f/all')
		) {
			addListFilter('subreddits', 'subreddit');
		}
		addListFilter('flair', 'linkFlair', { fullMatch: false });
	}

	if (storedFilters) _.merge(filters, storedFilters);
	filterline.restoreState(filters);

	let visible = initialVisibility || filterline.hasActiveLineFilters();

	if (visible) {
		BodyClasses.add('res-filteReddit-filterline-pad-until-ready');
	}

	function go() {
		const insertFilterline = _.once(() => {
			filterline.createElement();

			if (isPageType('comments')) {
				document.querySelector('.comments-page .nestedlisting').before(filterline.element);
			} else {
				document.querySelector('#siteTable, .search-result-listing').before(filterline.element);
			}

			BodyClasses.remove('res-filteReddit-filterline-pad-until-ready');
		});

		const filterlineTab = CreateElement.tabMenuItem({
			text: '',
			title: 'Toggle Filterline visibility',
			className: 'res-toggle-filterline-visibility',
			checked: visible,
		});

		filterlineTab.addEventListener('change', ({ detail: newVisibilityState }: any) => {
			toggleVisibility(newVisibilityState);
			if (visible) scrollToElement(filterline.element, null, { scrollStyle: 'legacy' });
		});

		const ensureVisible = () => { if (!visible) filterlineTab.click(); };

		const { getTip, executeCommand } = filterline.getCLI();
		CommandLine.registerCommand(
			/(fl|filterline)/,
			'fl - modify Filterline',
			(cmd, val) => getTip(val),
			(cmd, val) => { ensureVisible(); executeCommand(val); },
		);

		CommandLine.registerCommand(
			/fp/,
			'fp - toggle filtering',
			() => 'Toggle filtering',
			() => { ensureVisible(); filterline.poweredElement.click(); },
		);

		function toggleVisibility(newVisibilityState) {
			if (newVisibilityState) {
				insertFilterline();
				filterlineTab.removeAttribute('aftercontent');
				RESTips.addFeatureTip('filterlineVisible', { ...featureTips.filterlineVisible, attachTo: filterline.element });
			} else if (filterline.hasActiveLineFilters()) {
				filterlineTab.setAttribute('aftercontent', ' (active)');
			}

			BodyClasses.toggle(newVisibilityState, 'res-filteReddit-show-filterline');

			if (visible !== newVisibilityState) {
				filterlineStorage.patch({ visible: newVisibilityState });
				visible = newVisibilityState;
			}
		}

		RESTips.addFeatureTip('filterline', {
			...featureTips.filterline,
			attachTo: filterlineTab,
			continuation: () => {
				ensureVisible();
				return 'filterlineVisible';
			},
		});

		toggleVisibility(visible);
	}

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

export function addOndemandCase(customFilter: BuilderRootValue, onlyUseful: boolean = false) {
	const getConditions = () => Cases.resolveGroup(customFilter.body);

	if (!onlyUseful || Cases.isUseful(getConditions().type)) {
		return Cases.createAdHoc(customFilter.id, (customFilter.opts || {}).name, getConditions, 'ondemand', thingType, customFilter);
	} else {
		return Cases.Inert;
	}
}

export function addCustomFilter({ body, opts }: {| body: *, opts?: * |}): BuilderRootValue {
	const customFilter = {
		note: `From ${fullLocation()}`,
		ver: 3,
		id: `customFilter-${Date.now()}`,
		body,
		opts,
	};

	Options.set(module, customFilterVariant, [customFilter, ...module.options[customFilterVariant].value]);

	return customFilter;
}

export function updateCustomFilter(customFilter: BuilderRootValue, val: $Shape<BuilderRootValue>) {
	// XXX May leave trash in the object
	extendDeep((customFilter: any), (val: any)); // This mutates the option array
	Options.set(module, customFilterVariant, module.options[customFilterVariant].value);
}

export async function saveFilterlineStateAsDefault(type: string) {
	const { storage } = defaultFilters.find(v => v.type === type) || {};
	if (!storage) throw new Error(`Could not find storage for type ${type}`);

	const v: LineState = (await filterlineStorage.get(): any);
	let { filters } = _.cloneDeep(v) || {};
	if (_.isEmpty(filters)) filters = null;
	await storage.set(filters);
	Notifications.showNotification('Saved.', 1000);
}

function getStringMatchConditions(source, caseType, additionalCriteria) {
	const [matchString = '', applyTo = 'everywhere', applyList = '', except = ''] = Array.isArray(source) ? source : [source];

	let applyToConditions;
	if (applyTo !== 'everywhere') {
		const subreddits = applyList.split(',');

		if (subreddits.findIndex(v => !v) !== -1) {
			console.error('Filter must have subreddits specified', source);
			return { type: 'false' };
		}

		applyToConditions = Cases.getGroup(applyTo === 'exclude' ? 'none' : 'any', [
			// /r/all special case
			// (nothing is posted to /r/all, but we could be browsing it)
			subreddits.includes('all') ? {
				type: 'currentSub',
				patt: 'all',
			} : null,
			// and the same for /r/popular
			subreddits.includes('popular') ? {
				type: 'currentSub',
				patt: 'popular',
			} : null,
			// normal subreddit include/exclude
			...subreddits.map(sr => ({
				type: 'subreddit',
				patt: sr,
			})),
		].filter(Boolean));
	}

	return Cases.getGroup('all', [
		// applyTo filtering
		applyToConditions || null,
		// main filter
		{
			type: caseType,
			patt: matchString,
			...additionalCriteria,
		},
		// filter exclusions
		(except && except.length) && Cases.getGroup('none', [{
			type: caseType,
			patt: except,
			...additionalCriteria,
		}]) || null,
	].filter(Boolean));
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

const regexRegex = /^\/(.*)\/([gim]+)?$/;

const reconcileNativeFilters = (() => {
	// Ideally, we would just get the subscriber count for each subreddit.
	// However, there's no batch endpoint for subreddit info.
	// So we use a different proxy for subreddit popularity: the top post score from the last day.
	// By doing so, we can leverage ad-hoc multireddits to get multiple results from a single request.
	// In testing, this method achieves ~15 requests/500 subreddits or ~33 subreddits/request.
	const MAX_RETRIES = 5;
	const getTopScore = batch(async requests => {
		const resp = (await ajax({
			url: `/r/${requests.map(r => r.sub).join('+')}/top.json`,
			query: { t: 'day', limit: 100 },
			type: 'json',
		}): RedditListing<RedditLink>);

		if (!resp.data.children.length) {
			// guarantee that we always make progress:
			// if there are no posts, return `0` for all requests
			return requests.map(() => 0);
		}

		const topScoreBySub = flow(
			() => resp.data.children.reverse(),
			keyBy(post => post.data.subreddit.toLowerCase()),
			mapValues(post => post.data.score)
		)();

		return requests.map(({ sub, depth = 0 }: {| sub: string, depth?: number |}) => {
			const score = topScoreBySub[sub.toLowerCase()];

			if (score !== undefined) {
				// post found
				return score;
			} else if (depth > MAX_RETRIES) {
				// out of retries
				return 0;
			} else {
				// try again until we get a score
				return getTopScore({ sub, depth: depth + 1 });
			}
		});
	}, { size: 100, delay: 2000 });

	async function sortByPopularity(subreddits: string[]): Promise<string[]> {
		const scores = await Promise.all(subreddits.map(sub => getTopScore({ sub })));

		return _.sortBy(_.zip(subreddits, scores), ([, score]) => score)
			.map(([sub]) => sub)
			.filter(Boolean)
			.reverse();
	}

	return mutex(async ({ warnNotLoggedIn = false }: {| warnNotLoggedIn?: boolean |} = {}) => {
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

		Notifications.showNotification({
			moduleID: module.moduleID,
			notificationID: 'filterSyncStarted',
			message: 'Filter sync started...',
		});

		const { data: { subreddits } } = await ajax({
			url: `/api/filter/user/${user}/f/all`,
			type: 'json',
		});

		const existing = subreddits.map(({ name }) => name.toLowerCase());

		const desired = await asyncFlow(
			map(([sr]) => sr),
			filter(sr => !regexRegex.test(sr)),
			map(name => name.toLowerCase()),
			sortByPopularity,
			slice(0, 100)
		)(module.options.subreddits.value);

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
})();

const subredditAllowNsfwOption = _.once(() => indexOptionTable(module.options.allowNSFW, 0, key => key.toLowerCase()));

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

function updateNsfwBodyClass(filterOn) {
	BodyClasses.toggle(filterOn, 'hideOver18');
}

function registerSubredditFilterCommand() {
	const getSubreddit = val => (
		val ||
		SelectedEntry.selectedThing && SelectedEntry.selectedThing.getSubreddit() ||
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
