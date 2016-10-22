import _ from 'lodash';
import { $ } from '../vendor';
import * as Options from '../core/options';
import {
	BodyClasses,
	Thing,
	currentDomain,
	currentMultireddit,
	currentSubreddit,
	currentUserProfile,
	CreateElement,
	indexOptionTable,
	isCurrentMultireddit,
	isCurrentSubreddit,
	isPageType,
	loggedInUser,
	string,
	watchForElement,
} from '../utils';
import { isURLVisited } from '../environment';
import * as CommandLine from './commandLine';
import * as CustomToggles from './customToggles';
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
	showFilterVisitedLinks: {
		type: 'boolean',
		value: process.env.BUILD_TARGET !== 'safari' && process.env.BUILD_TARGET !== 'edge',
		noconfig: process.env.BUILD_TARGET === 'safari' || process.env.BUILD_TARGET === 'edge',
		description: 'Show a \'filter visited links\' tab at the top of each subreddit, to easily toggle whether to filter visited posts.',
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
			score: {
				name: 'Score',
				defaultTemplate(op, val) {
					return {
						type: 'score',
						op: (op || '>'),
						val: (val || 0),
					};
				},
				fields: [
					'post has ',
					{ type: 'select', options: 'COMPARISON', id: 'op' },
					' ',
					{ type: 'number', id: 'val' },
					'points',
				],
				evaluate(thing, data) {
					const score = thing.getScore();
					if (typeof score === 'undefined') {
						return false;
					}

					return numericalCompare(data.op, score, data.val);
				},
			},
			subreddit: {
				name: 'Subreddit',
				defaultTemplate(patt) {
					return { type: 'subreddit', patt: patt || '' };
				},
				fields: [
					'posted in /r/', { type: 'text', id: 'patt', validator: RegExp },
				],
				evaluate(thing, data) {
					const subreddit = thing.getSubreddit();
					if (!subreddit) {
						return false;
					}
					const pattern = new RegExp(`^(${data.patt})$`, 'i');
					return pattern.test(subreddit.trim());
				},
			},
			username: {
				name: 'Username',
				defaultTemplate(patt) {
					return { type: 'username', patt: patt || '' };
				},
				fields: [
					'posted by /u/', { type: 'text', id: 'patt', validator: RegExp },
				],
				evaluate(thing, data) {
					const user = thing.getAuthor();
					if (!user) {
						return false;
					}
					const pattern = new RegExp(`^(${data.patt})$`, 'i');
					return pattern.test(user);
				},
			},
			commentCount: {
				name: 'Comment count',
				defaultTemplate(op, val) {
					return { type: 'commentCount', op: op || '>', val: val || 0 };
				},
				fields: [
					'post has ',
					{ type: 'select', options: 'COMPARISON', id: 'op' },
					' ',
					{ type: 'number', id: 'val' },
					' comments',
				],
				evaluate(thing, data) {
					const commentCount = thing.getCommentCount();
					if (typeof commentCount !== 'number') {
						return false;
					}
					return numericalCompare(data.op, commentCount, data.val);
				},
			},
			userAttr: {
				name: 'User attribute (friend/mod/etc...)',
				defaultTemplate(cat) {
					return { type: 'userAttr', attr: cat || 'friend' };
				},
				fields: [
					'user is ',
					{
						type: 'select',
						id: 'attr',
						options: [
							['a friend', 'friend'],
							['a moderator', 'moderator'],
							['an admin', 'admin'],
							// ['op', 'submitter]',
							'me',
						],
					},
				],
				evaluate(thing, data) {
					if (data.attr === 'me') {
						// No standard marker for my own posts so compare against the logged in user
						let myName = loggedInUser();
						if (!myName) {
							return false;
						}
						const author = thing.getAuthor().toLowerCase();
						myName = myName.trim().toLowerCase();

						return author === myName;
					} else {
						// The other cases have hardcoded class names
						const element = thing.getAuthorElement();
						return element.classList.contains(data.attr);
					}
				},
			},
			domain: {
				name: 'Link domain name',
				defaultTemplate(dom) {
					return { type: 'domain', patt: dom || '' };
				},
				fields: [
					'post links to the domain ',
					{ type: 'text', id: 'patt', validator: RegExp },
				],
				evaluate(thing, data) {
					const domain = thing.getPostDomain();
					if (!domain) {
						return false;
					}
					const pattern = new RegExp(`^(${data.patt})$`, 'i');
					return pattern.test(domain);
				},
			},
			dow: {
				name: 'Day of week',
				defaultTemplate() {
					return { type: 'dow', days: [] };
				},
				fields: [
					'current day of the week is ',
					{
						type: 'checkset',
						id: 'days',
						// Uses same 3 letter names as
						// .toLocaleDateString('en-US', {weekday: 'short'}))
						items: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat'.split(','),
					},
				],
				evaluate(thing, data) {
					// duplicating because I was having issues with accessing a variable before it was assigned
					const dayList = 'Sun,Mon,Tue,Wed,Thu,Fri,Sat'.split(',');
					// Get 3 letter name
					const currentDOW = dayList[new Date().getDay()];

					// At the time of writing Safari doesn't support the toLocaleDateString
					// const currentDOW = new Date().toLocaleDateString('en-US', {weekday: 'short'});
					return data.days.includes(currentDOW);
				},
			},
			linkFlair: {
				name: 'Link flair',
				defaultTemplate(patt) {
					return { type: 'linkFlair', patt: patt || '' };
				},
				fields: [
					'post has link flair matching ',
					{ type: 'text', id: 'patt', validator: RegExp },
				],
				evaluate(thing, data) {
					const text = thing.getPostFlairText();
					if (!text) {
						return false;
					}
					const pattern = new RegExp(`^(${data.patt})$`, 'i');
					return pattern.test(text.trim());
				},
			},
			userFlair: {
				name: 'User flair',
				defaultTemplate(patt) {
					return { type: 'userFlair', patt: patt || '' };
				},
				fields: [
					'author of this post has flair matching ',
					{ type: 'text', id: 'patt', validator: RegExp },
				],
				evaluate(thing, data) {
					const text = thing.getUserFlairText();
					if (!text) {
						return false;
					}
					const pattern = new RegExp(`^(${data.patt})$`, 'i');
					return pattern.test(text);
				},
			},
			postType: {
				name: 'Post type',
				defaultTemplate(kind) {
					return { type: 'postType', kind: kind || 'link' };
				},
				fields: [
					'post is a ', {
						// id: 'type' results in a collsion
						type: 'select',
						id: 'kind',
						options: [
							['link post', 'link'],
							['self post', 'self'],
							// 'comment',
						],
					}, '.',
				],
				evaluate(thing, data) {
					switch (data.kind) {
						case 'comment': return thing.isComment();
						case 'link':    return thing.isSelfPost();
						case 'self':    return thing.isLinkPost();
						default: throw new Error(`unknown post type "${data.kind}"`);
					}
				},
			},
			postTitle: {
				name: 'Post title',
				defaultTemplate(patt) {
					return { type: 'postTitle', patt: patt || '' };
				},
				fields: [
					'post\'s title contains ', { type: 'text', id: 'patt', validator: RegExp },
				],
				evaluate(thing, data) {
					const title = thing.getTitle();
					// Do not anchor for this case
					return new RegExp(data.patt, 'i').test(title);
				},
			},
			postAge: {
				name: 'Post age',
				defaultTemplate(age) {
					// 4 hours in milliseconds
					return { type: 'postAge', age: age || 4 * 60 * 60 * 1000 };
				},
				fields: [
					'post is ',
					{
						type: 'select',
						id: 'op',
						options: [
							['more than', '>'],
							['less than', '<'],
						],
					},
					' ', { type: 'duration', id: 'age' }, ' old',
				],
				evaluate(thing, data) {
					const postTime = thing.getTimestamp();
					if (!postTime) {
						return false;
					}
					const now = new Date();
					return numericalCompare(data.op, now - postTime, data.age);
				},
			},
			currentSub: {
				name: 'When browsing a subreddit',
				defaultTemplate(patt) {
					return { type: 'currentSub', patt: patt || '' };
				},
				fields: [
					'when browsing /r/',
					{ type: 'text', id: 'patt', validator: RegExp },
				],
				evaluate(thing, data) {
					const sub = currentSubreddit();
					if (!sub) return false;
					return new RegExp(`^(${data.patt})$`, 'i').test(sub);
				},
			},
			currentUserProfile: {
				name: 'When browsing a user profile',
				defaultTemplate(patt) {
					return { type: 'currentUserProfile', patt: patt || '' };
				},
				fields: [
					'when browsing /u/',
					{ type: 'text', id: 'patt', validator: RegExp },
					'\'s posts',
				],
				evaluate(thing, data) {
					const user = currentUserProfile();
					if (!user) return false;
					return new RegExp(`^(${data.patt})$`, 'i').test(user);
				},
			},
			currentMulti: {
				name: 'When browsing a multireddit',
				defaultTemplate(user, name) {
					return { type: 'currentMulti', user: user || '', name: name || '' };
				},
				fields: [
					'when browsing /u/',
					{ type: 'text', id: 'user', validator: RegExp },
					'/m/',
					{ type: 'text', id: 'name', validator: RegExp },
				],
				evaluate(thing, data) {
					const parts = (/^(?:user\/)?([a-z0-9_-]+)\/m\/([a-z0-9_-]+)$/i)
						.exec(currentMultireddit());
					if (!parts) return false;
					const multiNameRE = data.name.trim() === '' ? /.*/ : new RegExp(`^(${data.name})$`, 'i');
					const user = parts[1];
					const multi = parts[2];
					if (user === 'me' && data.name.trim() === 'me') {
						return multiNameRE.test(multi);
					} else {
						return (data.user.trim() === '' ? /.*/ : new RegExp(`^(${data.user})$`, 'i')).test(user) && multiNameRE.test(multi);
					}
				},
			},
			browsingFrontPage: {
				name: 'Browsing the front page',
				defaultTemplate() {
					return { type: 'browsingFrontPage' };
				},
				fields: [
					'when browsing the front page',
				],
				evaluate() {
					return isPageType('linklist') &&
						!currentSubreddit() &&
						!currentMultireddit() &&
						!currentUserProfile();
				},
			},
			isNSFW: {
				name: 'NSFW post',
				defaultTemplate() {
					return { type: 'isNSFW' };
				},
				fields: [
					'post is marked NSFW',
				],
				evaluate(thing) {
					return thing.isNSFW();
				},
			},
			loggedInAs: {
				name: 'Logged in user',
				defaultTemplate(patt) {
					return { type: 'loggedInAs', patt: patt || '' };
				},
				fields: [
					'logged in as /u/',
					{ type: 'text', id: 'loggedInAs', validator: RegExp },
				],
				evaluate(thing, data) {
					const myName = loggedInUser();
					if (!myName) {
						return false;
					}
					return new RegExp(`^(${data.loggedInAs})$`, 'i').test(myName);
				},
			},
			toggle: {
				name: 'Custom toggle',
				defaultTemplate() {
					return { type: 'toggle', toggleName: '' };
				},
				fields: [
					'custom toggle named',
					{ type: 'text', id: 'toggleName', validator: RegExp },
					'is turned on',
				],
				evaluate(thing, data) {
					const toggleName = data.toggleName;
					return CustomToggles.toggleActive(toggleName);
				},
			},
			/*
			possible for later:

			res tag
			res score
			up/down/unvoted
			sort
			//*/
		},
	},
};

function numericalCompare(op, a, b) {
	switch (op) {
		case '==':	return a == b; // eslint-disable-line eqeqeq
		case '!=':	return a != b; // eslint-disable-line eqeqeq
		case '>':	return a > b;
		case '<':	return a < b;
		case '>=':	return a >= b;
		case '<=':	return a <= b;
		default: throw new Error(`Unhandled operator ${op}`);
	}
}

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

module.shouldRun = () => !(
	module.options.excludeModqueue.value && isPageType('modqueue') ||
	module.options.excludeUserPages.value && isPageType('profile')
);

module.beforeLoad = () => {
	filterNSFW(module.options.NSFWfilter.value);
};

const $nsfwSwitch = _.once(() => $(CreateElement.toggleButton(undefined, 'nsfwSwitchToggle', module.options.NSFWfilter.value)));
let removeVisitedLinksActive = false;

module.go = () => {
	if (module.options.NSFWQuickToggle.value) {
		Menu.addMenuItem($('<div>', {
			text: 'nsfw filter',
			title: 'Toggle NSFW Filter',
			append: $nsfwSwitch(),
		}), toggleNsfwFilter);
	}

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

	if (isPageType('linklist')) {
		if (module.options.showFilterVisitedLinks.value) {
			CreateElement.tabMenuItem({
				text: 'filter visited links',
				className: 'res-filter-visited-links',
			}).addEventListener('change', e => {
				removeVisitedLinksActive = e.detail;
				scanEntries();
			});
		}
	}
};

function toggleNsfwFilter(toggle, notify) {
	if (toggle === false || module.options.NSFWfilter.value) {
		filterNSFW(false);
		Options.set(module, 'NSFWfilter', false);
		$nsfwSwitch().removeClass('enabled');
	} else {
		filterNSFW(true);
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
			// Do not apply any other filters if posts belong to me
			if (module.options.excludeOwnPosts.value) {
				const postAuthor = thing.getAuthor().toLowerCase();
				// No standard marker for my own posts so compare against the logged in user
				const myName = loggedInUser();
				if (myName && (myName.toLowerCase() === postAuthor)) {
					return;
				}
			}

			const postTitle = thing.getTitle();
			const postDomain = thing.getPostDomain();
			const postFlair = thing.getPostFlairText();
			const postLink = thing.getPostLink();

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
				numFiltered++;
				thing.toggleFilter(true);
				return;
			}

			// Run async (slow) filters separately
			// Note: These won't be counted in numFiltered
			(async () => {
				if (postLink) filtered = removeVisitedLinksActive && await isURLVisited(postLink.href);

				thing.toggleFilter(filtered);
			})();
		}

		if (thing.isNSFW()) {
			if (allowNSFW(postSubreddit, currSub)) {
				thing.element.classList.add('allowOver18');
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
		if (numFiltered) notification.push(`${numFiltered} post(s) hidden by ${SettingsNavigation.makeUrlHashLink(module.moduleID, 'keywords', 'custom filters')}.`);
		if (numNsfwHidden) notification.push(`${numNsfwHidden} post(s) hidden by the ${SettingsNavigation.makeUrlHashLink(module.moduleID, 'NSFWfilter', 'NSFW filter')}.`);
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
						moduleID: module.moduleID,
						optionKey: type,
						notificationID: 'badRegexpPattern',
						header: 'filteReddit RegExp issue',
						message: string.escapeHTML`
							There was a problem parsing a RegExp in your filteReddit settings.
							${SettingsNavigation.makeUrlHashLink(module.moduleID, type, 'Correct it now.')}
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
