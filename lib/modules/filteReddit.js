import { $ } from '../vendor';
import * as Options from '../core/options';
import {
	BodyClasses,
	Thing,
	currentDomain,
	currentMultireddit,
	currentSubreddit,
	currentUserProfile,
	indexOptionTable,
	isCurrentMultireddit,
	isCurrentSubreddit,
	isPageType,
	loggedInUser,
	string,
	watchForElement,
} from '../utils';
import * as CommandLine from './commandLine';
import * as Menu from './menu';
import * as Notifications from './notifications';
import * as SelectedEntry from './selectedEntry';
import * as SettingsNavigation from './settingsNavigation';

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
		type: 'boolean',
		value: false,
		description: 'Filters all links labelled NSFW',
	},
	notificationThreshold: {
		type: 'text',
		value: '80',
		description: 'If more than this percentage (0-100) of a page is filtered, show a notification',
		advanced: true,
	},
	NSFWQuickToggle: {
		type: 'boolean',
		value: true,
		description: 'Add a quick NSFW on/off toggle to the gear menu',
		advanced: true,
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
	customFilters: Options.builders.postCommentIdentifier({
		description: 'Hide posts based on complex custom criteria. <p>This is a very advanced feature, please <a href="http://www.reddit.com/r/Enhancement/wiki/customfilters">read the guide</a> before asking questions.  <p style="font-weight: bold; font-size: 16pt;">This feature is currently in beta. Filters may break in future RES updates.</p>',
	})
};

module.include = [
	'linklist',
	'modqueue',
	'profile',
	'comments',
	'search',
];
module.exclude = [
	// /^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
	// /^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/comments\/[-\w\.]+/i
	/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/over18.*/i,
];

const excludeSaved = /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/user\/[\w]+\/saved/i;

module.shouldRun = function() {
	if (
		this.options.excludeModqueue.value && isPageType('modqueue') ||
		this.options.excludeUserPages.value && isPageType('profile')
	) {
		return false;
	}

	return true;
};

module.beforeLoad = function() {
	filterNSFW(this.options.NSFWfilter.value);
};

let nsfwSwitchToggle;

module.always = function() {
	const $toggleOn = $('<span>', { class: 'toggleOn', text: 'on' });
	const $toggleOff = $('<span>', { class: 'toggleOff', text: 'off' });
	const nsfwSwitch = document.createElement('div');
	nsfwSwitch.setAttribute('title', 'Toggle NSFW Filter');
	function onClickSwitch(e) {
		e.preventDefault();
		toggleNsfwFilter();
	}
	nsfwSwitch.textContent = 'nsfw filter';
	nsfwSwitchToggle = $('<div>', { id: 'nsfwSwitchToggle', class: 'toggleButton' })
		.append($toggleOn)
		.append($toggleOff)
		.get(0);
	nsfwSwitch.appendChild(nsfwSwitchToggle);
	if (this.options.NSFWfilter.value) {
		nsfwSwitchToggle.classList.add('enabled');
	} else {
		nsfwSwitchToggle.classList.remove('enabled');
	}
	Menu.addMenuItem(nsfwSwitch, onClickSwitch);
};

module.go = function() {
	scanEntries();
	watchForElement('siteTable', scanEntries);

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
};

function toggleNsfwFilter(toggle, notify) {
	if (toggle === false || module.options.NSFWfilter.value) {
		filterNSFW(false);
		Options.set(module, 'NSFWfilter', false);
		$(nsfwSwitchToggle).removeClass('enabled');
	} else {
		filterNSFW(true);
		Options.set(module, 'NSFWfilter', true);
		$(nsfwSwitchToggle).addClass('enabled');
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

function scanEntries(ele) {
	if (module.options.excludeCommentsPage.value && isPageType('comments')) {
		return;
	}
	let numFiltered = 0;
	let numNsfwHidden = 0;

	const things = Thing.things(ele);

	// const RALLre = /\/r\/all\/?(([\w]+)\/)?/i;
	// const onRALL = RALLre.exec(location.href);
	const filterSubs = (module.options.filterSubredditsFrom.value === 'everywhere') ||
		(module.options.filterSubredditsFrom.value === 'everywhere-except-subreddit' && !currentSubreddit()) ||
		isCurrentSubreddit('all') || currentDomain() || isCurrentMultireddit('me/f/all');
	const onSavedPage = excludeSaved.test(location.href);

	things.forEach(thing => {
		let postSubreddit, currSub;
		if (thing.isPost() && !onSavedPage) {
			const postTitle = thing.getTitle();
			const postDomain = thing.getPostDomain();
			const postFlair = thing.getPostFlairText();

			let filtered = executeCustomFilters(thing);

			currSub = currentSubreddit() ? currentSubreddit().toLowerCase() : null;
			postSubreddit = thing.getSubreddit() || currSub;

			if (!filtered) filtered = filterTitle(postTitle, postSubreddit);
			if (!filtered) filtered = filterDomain(postDomain, postSubreddit || currSub);
			if ((!filtered) && (filterSubs) && (postSubreddit)) {
				filtered = filterSubreddit(postSubreddit);
			}
			if ((!filtered) && (postFlair)) {
				filtered = filterFlair(postFlair, postSubreddit);
			}
			if (filtered) {
				thing.element.classList.add('RESFiltered');
				numFiltered++;
			}
		}

		if (thing.isNSFW()) {
			if (allowNSFW(postSubreddit, currSub)) {
				thing.entry.classList.add('allowOver18');
			} else if (module.options.NSFWfilter.value) {
				if (!thing.element.classList.contains('over18')) {
					// backfill for new post layout
					thing.element.classList.add('over18');
				}
				numNsfwHidden++;
			}
		}
	});

	let notificationThreshold = parseInt(module.options.notificationThreshold.value, 10);
	if (typeof notificationThreshold !== 'number' || isNaN(notificationThreshold)) {
		notificationThreshold = module.options.notificationThreshold.default;
	}
	notificationThreshold = Math.max(0, Math.min(notificationThreshold, 110)); // so users can go the extra 10% to avoid notifications completely
	notificationThreshold /= 100;

	const percentageHidden = (numFiltered + numNsfwHidden) / things.length;
	if (things.length && percentageHidden >= notificationThreshold) {
		const notification = [];
		if (!percentageHidden) notification.push('No posts were filtered.');
		if (numFiltered) notification.push(`${numFiltered} post(s) hidden by ${SettingsNavigation.makeUrlHashLink('filteReddit', 'keywords', 'custom filters')}.`);
		if (numNsfwHidden) notification.push(`${numNsfwHidden} post(s) hidden by the ${SettingsNavigation.makeUrlHashLink('filteReddit', 'NSFWfilter', 'NSFW filter')}.`);
		if (numNsfwHidden && module.options.NSFWQuickToggle.value) notification.push('You can toggle the nsfw filter in the <span class="gearIcon"></span> menu.');

		Notifications.showNotification({
			header: 'Posts Filtered',
			moduleID: 'filteReddit',
			message: notification.join('<br><br>'),
		});
	}
}

function filterNSFW(filterOn) {
	if (filterOn) {
		BodyClasses.add('hideOver18');
	} else {
		BodyClasses.remove('hideOver18');
	}
}

function filterTitle(title, reddit) {
	reddit = reddit ? reddit.toLowerCase() : null;
	return filtersMatchString('keywords', title.toLowerCase(), reddit);
}

function filterDomain(domain, reddit) {
	domain = domain ? domain.toLowerCase() : null;
	reddit = reddit ? reddit.toLowerCase() : null;
	return filtersMatchString('domains', domain, reddit);
}

function filterSubreddit(subreddit) {
	return filtersMatchString('subreddits', subreddit.toLowerCase(), null, true);
}

function filterFlair(flair, reddit) {
	reddit = reddit ? reddit.toLowerCase() : null;
	return filtersMatchString('flair', flair.toLowerCase(), reddit);
}

const _filters = {};

function getFilters(type) {
	const sources = module.options[type].value;
	if (!_filters[type] || _filters[type].length !== sources.length) {
		const filters = [];
		_filters[type] = filters;

		sources.forEach(source => {
			const filter = {};
			filters.push(filter);

			if (typeof source !== 'object') {
				source = [source];
			}

			let searchString = source[0];
			if (module.options.regexpFilters.value && regexRegex.test(searchString)) {
				const regexp = regexRegex.exec(searchString);
				try {
					searchString = new RegExp(regexp[1], regexp[2]);
				} catch (e) {
					Notifications.showNotification({
						moduleID: 'filteReddit',
						optionKey: type,
						notificationID: 'badRegexpPattern',
						header: 'filteReddit RegExp issue',
						message: string.escapeHTML`
							There was a problem parsing a RegExp in your filteReddit settings.
							${SettingsNavigation.makeUrlHashLink('filteReddit', type, 'Correct it now.')}
							<p>RegExp: <code>${searchString}</code></p>
							<blockquote>${e.toString()}</blockquote>
						`,
					});
				}
			} else {
				searchString = searchString.toString().toLowerCase();
			}
			filter.searchString = searchString;

			const applyTo = source[1] || 'everywhere';
			filter.applyTo = applyTo;

			const applyList = (source[2] || '').toLowerCase().split(',');
			filter.applyList = applyList;

			const exceptSearchString = source[3] && source[3].toString().toLowerCase() || '';
			filter.exceptSearchString = exceptSearchString;
		});
	}

	return _filters[type];
}

let allowAllNsfw = null; // lazy loaded with boolean-y value
let subredditAllowNsfwOption = null; // lazy loaded with function to get a given subreddit's row in module.options.allowNSFW

function allowNSFW(postSubreddit, currSubreddit = currentSubreddit()) {
	if (!module.options.allowNSFW.value || !module.options.allowNSFW.value.length) return false;

	if (!subredditAllowNsfwOption) {
		subredditAllowNsfwOption = indexOptionTable(module.options.allowNSFW, 0);
	}

	if (allowAllNsfw === null && currSubreddit) {
		const currOptionValue = subredditAllowNsfwOption(currSubreddit);
		allowAllNsfw = (currOptionValue && currOptionValue[0][1] === 'visit') || false;
	}
	if (allowAllNsfw) {
		return true;
	}

	if (!postSubreddit) postSubreddit = currSubreddit;
	if (!postSubreddit) return false;
	const postOptionValue = subredditAllowNsfwOption(postSubreddit);
	if (postOptionValue) {
		if (postOptionValue[0][1] === 'everywhere') {
			return true;
		} else { // optionValue[1] == visit (subreddit or multisubreddit)
			return (currSubreddit || '').split('+').includes(postSubreddit);
		}
	}
	return false;
}

const regexRegex = /^\/(.*)\/([gim]+)?$/;

function filtersMatchString(filterType, stringToSearch, reddit, fullmatch) {
	const filters = getFilters(filterType);
	if (!filters || !filters.length) return false;
	if (!stringToSearch) {
		// this means a bad filter of some sort...
		return false;
	}

	return filters.some(filter => {
		// we also want to know if we should be matching /r/all, because when getting
		// listings on /r/all, each post has a subreddit (that does not equal "all")
		const checkRAll = isCurrentSubreddit('all') && filter.applyList.includes('all');
		switch (filter.applyTo) {
			case 'exclude':
				if (filter.applyList.includes(reddit) || checkRAll) {
					return false;
				}
				break;
			case 'include':
				if (!filter.applyList.includes(reddit) && !checkRAll) {
					return false;
				}
				break;
			default:
				break;
		}

		if (filter.exceptSearchString.length && stringToSearch.includes(filter.exceptSearchString)) {
			return false;
		}

		if (filter.searchString.test) {
			// filter is a regex
			return filter.searchString.test(stringToSearch);
		} else if (fullmatch) {
			// simple full string match
			return stringToSearch === filter.searchString;
		} else {
			// simple in-string match
			return stringToSearch.includes(filter.searchString);
		}
	});
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

function executeCustomFilters(thing) {
	const advancedFilterOptions = module.options.customFilters;
	const filters = advancedFilterOptions.value;
	const config = advancedFilterOptions.cases;
	return filters.some(filter => config[filter.body.type].evaluate(thing, filter.body, config));
}
