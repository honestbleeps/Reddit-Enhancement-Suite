import _ from 'lodash';
import { $ } from '../vendor';
import * as Options from '../core/options';
import {
	BodyClasses,
	Thing,
	currentDomain,
	currentSubreddit,
	CreateElement,
	loggedInUser,
	indexOptionTable,
	isCurrentMultireddit,
	isCurrentSubreddit,
	isPageType,
	string,
	watchForElement,
} from '../utils';
import { Storage } from '../environment';
import * as CommandLine from './commandLine';
import * as Menu from './menu';
import * as Notifications from './notifications';
import * as SelectedEntry from './selectedEntry';
import * as SettingsNavigation from './settingsNavigation';
import ExternalFilter from './filteReddit/ExternalFilter';
import Filterline from './filteReddit/Filterline';
import browseContexts from './filteReddit/browseContexts';
import postCases from './filteReddit/postCases';

export const module = {};

module.moduleID = 'filteReddit';
module.moduleName = 'filteReddit';
module.category = ['Subreddits', 'Submissions'];
module.description = 'Filter out NSFW content, or links by keyword, domain (use User Tagger to ignore by user) or subreddit (for /r/all or /domain/*).';
module.options = {
	// any configurable options you have go here...
	// options must have a type and a value..
	// valid types are: text, boolean (if boolean, value must be true or false)
	// for example:
	NSFWfilter: {
		title: 'NSFW Filter',
		type: 'boolean',
		value: false,
		description: 'Filters all links labelled NSFW',
	},
	NSFWQuickToggle: {
		type: 'boolean',
		value: true,
		description: 'Add a quick NSFW on/off toggle to the gear menu',
		advanced: true,
	},
	showFilterline: {
		type: 'boolean',
		value: false,
		description: 'Show filterline controls by default',
		bodyClass: true,
	},
	excludeOwnPosts: {
		type: 'boolean',
		value: true,
		description: 'Don\'t filter your own posts',
	},
	excludeCommentsPage: {
		type: 'boolean',
		value: true,
		description: 'When visiting the comments page for a filtered link, allow the link/expando to be shown',
	},
	excludeModqueue: {
		type: 'boolean',
		value: true,
		description: 'Don\'t filter anything on modqueue pages (modqueue, reports, spam, etc.)',
	},
	excludeUserPages: {
		type: 'boolean',
		value: false,
		description: 'Don\'t filter anything on users\' profile pages',
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
	},
	keywords: {
		type: 'table',
		addRowText: '+add filter',
		fields: [{
			name: 'keyword',
			type: 'text',
		}, {
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
			description: 'Apply filter to:',
		}, {
			name: 'subreddits',
			type: 'list',
			listType: 'subreddits',
		}, {
			name: 'unlessKeyword',
			type: 'text',
		}],
		value: [],
		description: `
			Hide posts with certain keywords in the title.
			\n\n<br><br>RegExp like <code>/(this|that|theother)/i</code> is allowed for keyword (but not unlessKeyword).
			\n\n<br>Find out more on the <a href="/r/Enhancement/wiki/index/filters/filtereddit/regexp">/r/Enhancement wiki</a>.
		`,
	},
	subreddits: {
		type: 'table',
		addRowText: '+add filter',
		fields: [{
			name: 'subreddit',
			type: 'text',
		}],
		value: [],
		description: `
			Hide posts submitted to certain subreddits.
			\n\n<br><br>RegExp like <code>/(this|that|theother)/i</code> is allowed for subreddit.
			\n\n<br>Find out more on the <a href="/r/Enhancement/wiki/index/filters/filtereddit/regexp">/r/Enhancement wiki</a>.
		`,
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
	},
	domains: {
		type: 'table',
		addRowText: '+add filter',
		fields: [{
			name: 'keyword',
			type: 'text',
		}, {
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
			description: 'Apply filter to:',
		}, {
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
	},
	flair: {
		type: 'table',
		addRowText: '+add filter',
		fields: [{
			name: 'keyword',
			type: 'text',
		}, {
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
			description: 'Apply filter to:',
		}, {
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
	},
	allowNSFW: {
		type: 'table',
		addRowText: '+add subreddits',
		description: 'Don\'t hide NSFW posts from certain subreddits when the NSFW filter is turned on.',
		fields: [
			{
				name: 'subreddits',
				type: 'list',
				listType: 'subreddits',
			},
			{
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
			},
		],
	},
	customFilters: {
		type: 'builder',
		advanced: true, // VERY
		description: 'Hide posts based on complex custom criteria. <p>This is a very advanced feature, please <a href="http://www.reddit.com/r/Enhancement/wiki/customfilters">read the guide</a> before asking questions.  <p style="font-weight: bold; font-size: 16pt;">This feature is currently in beta. Filters may break in future RES updates.</p>',
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
			..._.pickBy(postCases, v => !v.async), // customFilters doesn't support async yet
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
	/^\/over18.*/i,
];

module.shouldRun = () => !(
	module.options.excludeModqueue.value && isPageType('modqueue') ||
	module.options.excludeUserPages.value && isPageType('profile') ||
	module.options.excludeCommentsPage.value && isPageType('comments')
);

let filterlineKey;
let filterlineState;
let initialFilterlineVisibility;
let filterlineVisibilityOptionKey;

module.loadDynamicOptions = () => {
	const pageID = browseContexts.currentLocation.getCurrent();
	filterlineKey = `RESmodules.filteReddit.${pageID}`;
	filterlineVisibilityOptionKey = `filterline_${pageID}`;

	// Initiate async load now so state will be restored asap
	filterlineState = Storage.get(filterlineKey);

	module.options[filterlineVisibilityOptionKey] = {
		value: false,
		type: 'boolean',
		noconfig: true,
	};
};

module.beforeLoad = () => {
	updateNsfwBodyClass(module.options.NSFWfilter.value);

	initialFilterlineVisibility = module.options.showFilterline.value || module.options[filterlineVisibilityOptionKey].value;

	if (initialFilterlineVisibility) {
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

	const filterline = createFilterline();

	function scanEntries(ele) {
		const newThings = Thing.things(ele).filter(v => v.isPost());
		for (const thing of newThings) {
			updateNsfwThingClass(thing);

			if (
				module.options.excludeOwnPosts.value &&
				loggedInUser() && loggedInUser() === thing.getAuthor()
			) continue;

			filterline.addThing(thing);
		}
	}

	scanEntries();
	watchForElement('siteTable', scanEntries);

	registerSubredditFilterCommand();
};

function createFilterline() {
	const filterline = new Filterline();

	function addExternalFilters() {
		const externalFilters = [
			{
				key: 'keywords',
				evaluate(thing) { return filtersMatchString(this.key, thing.getTitle(), thing.getSubreddit()); },
				clearCache() { getStringMatchFilters.cache.delete(this.key); },
			}, {
				key: 'domains',
				evaluate(thing) { return filtersMatchString(this.key, thing.getPostDomain(), thing.getSubreddit()); },
				clearCache() { getStringMatchFilters.cache.delete(this.key); },
			}, {
				key: 'subreddits',
				state: ((module.options.filterSubredditsFrom.value === 'everywhere') ||
					(module.options.filterSubredditsFrom.value === 'everywhere-except-subreddit' && !currentSubreddit()) ||
					isCurrentSubreddit('all') || currentDomain() || isCurrentMultireddit('me/f/all')) ? false : null,
				evaluate(thing) { return filtersMatchString(this.key, thing.getSubreddit() || currentSubreddit(), null, true); },
				clearCache() { getStringMatchFilters.cache.delete(this.key); },
			}, {
				key: 'flair',
				evaluate(thing) { return filtersMatchString(this.key, thing.getPostFlairText(), thing.getSubreddit()); },
				clearCache() { getStringMatchFilters.cache.delete(this.key); },
			}, {
				key: 'customFilters',
				evaluate: executeCustomFilters,
			},
		];

		for (const options of externalFilters) {
			filterline.addFilter(new ExternalFilter({
				state: false, // Hide all that matches
				settingsHtml: SettingsNavigation.makeUrlHashLink(module.moduleID, options.key, ' ', 'gearIcon'),
				...options,
			}));
		}
	}

	function addPostCaseFilters() {
		for (const [key, options] of Object.entries(postCases)) {
			if (options.disabled) continue;

			options.key = key;
			options.filterlineKey = filterlineKey;

			filterline.addChoice(options);
			if (options.alwaysShow) filterline.createFilterFromKey(key, { add: true, id: key });
		}
	}

	const completeFilterline = _.once(() => {
		addPostCaseFilters();
		filterlineState.then(v => { if (v) filterline.restoreState(v); });
		filterline.createElement();
		BodyClasses.remove('res-filteReddit-filterline-pad-until-ready');
	});

	let visible = initialFilterlineVisibility;

	const filterlineTab = CreateElement.tabMenuItem({
		text: '∀',
		title: 'Toggle filterline',
		className: 'res-toggle-filterline-visibility',
		checked: visible,
	});

	function toggleVisibility(newVisibilityState) {
		if (newVisibilityState) {
			completeFilterline();
			filterlineTab.removeAttribute('aftercontent');
		} else if (filterline.getActiveFilters().find(v => !(v instanceof ExternalFilter))) {
			filterlineTab.setAttribute('aftercontent', ' (active)');
		}

		BodyClasses.toggle(newVisibilityState, 'res-filteReddit-show-filterline');

		if (visible !== newVisibilityState) {
			Options.set(module, filterlineVisibilityOptionKey, newVisibilityState);
			visible = newVisibilityState;
		}
	}

	filterlineTab.addEventListener('change', ({ detail: newVisibilityState }) => { toggleVisibility(newVisibilityState); });

	// When using the command line, show the filterline
	filterline.enableCommandLineInterface(() => { if (!visible) filterlineTab.click(); });

	addExternalFilters();

	if (initialFilterlineVisibility) {
		toggleVisibility(true);
	}

	return filterline;
}

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

function executeCustomFilters(thing) {
	const { cases: config, value: filters } = module.options.customFilters;
	return filters.find(filter => config[filter.body.type].evaluate(thing, filter.body, config));
}

const regexRegex = /^\/(.*)\/([gim]+)?$/;

const getStringMatchFilters = _.memoize(type => {
	const sources = module.options[type].value;

	return sources.map(source => {
		const [matchString, applyTo = 'everywhere', applyList = '', except = ''] = Array.isArray(source) ? source : [source];

		let whenMatching;
		if (module.options.regexpFilters.value && regexRegex.test(matchString)) {
			const regexp = regexRegex.exec(matchString);
			try {
				whenMatching = new RegExp(regexp[1], regexp[2]);
			} catch (e) {
				Notifications.showNotification({
					moduleID: module.moduleID,
					optionKey: type,
					notificationID: 'badRegexpPattern',
					header: 'filteReddit RegExp issue',
					message: string.escapeHTML`
						There was a problem parsing a RegExp in your filteReddit settings.
						${SettingsNavigation.makeUrlHashLink(module.moduleID, type, 'Correct it now.')}
						<p>RegExp: <code>${matchString}</code></p>
						<blockquote>${e.toString()}</blockquote>
					`,
				});
				return null;
			}
		} else {
			whenMatching = matchString.toLowerCase();
		}

		return {
			whenMatching,
			applyTo,
			applyList: applyList.toLowerCase().split(','),
			except: except.toLowerCase(),
			source,
		};
	}).filter(v => v);
});

function filtersMatchString(
	type,
	compareString,
	subreddit = currentSubreddit(),
	matchFullString = false
) {
	if (compareString) compareString = compareString.toLowerCase();
	else return false;

	const result = getStringMatchFilters(type).find(filter => {
		// we also want to know if we should be matching /r/all, because when getting
		// listings on /r/all, each post has a subreddit (that does not equal "all")
		const checkRAll = isCurrentSubreddit('all') && filter.applyList.includes('all');
		if (
			(filter.applyTo === 'exclude' && (filter.applyList.includes(subreddit) || checkRAll)) ||
			(filter.applyTo === 'include' && (!filter.applyList.includes(subreddit) && !checkRAll))
		) return false;

		if (filter.except.length && compareString.includes(filter.except)) return false;

		if (filter.whenMatching instanceof RegExp) return filter.whenMatching.test(compareString);
		else if (matchFullString) return compareString === filter.whenMatching;
		else return compareString.includes(filter.whenMatching);
	});

	return result && result.source;
}

/**
 * @param {string} subreddit
 * @returns {boolean} Whether the subreddit was added (true) or removed (false) from the filter list.
 */
export function toggleFilter(subreddit) {
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
