import _ from 'lodash';
import escapeStringRegexp from 'escape-string-regexp';
import { $ } from '../vendor';
import * as Options from '../core/options';
import {
	asyncFind,
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
	regexes,
	isPageType,
	loggedInUser,
	randomHash,
	string,
	waitForEvent,
	watchForElement,
	hide,
	unhide,
} from '../utils';
import { isURLVisited, Storage } from '../environment';
import filterlineTemplate from '../templates/filterline.mustache';
import filterlineFilterTemplate from '../templates/filterlineFilter.mustache';
import filterlineExternalFilterTemplate from '../templates/filterlineExternalFilter.mustache';
import * as CommandLine from './commandLine';
import * as CustomToggles from './customToggles';
import * as Menu from './menu';
import * as Notifications from './notifications';
import * as SelectedEntry from './selectedEntry';
import * as SettingsNavigation from './settingsNavigation';
import * as ShowImages from './showImages';

export const module = {};

const browseContexts = {
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
			const rawMulti = currentMultireddit();
			if (!rawMulti) return false;
			const parts = (/^(?:user\/)?([a-z0-9_-]+)\/m\/([a-z0-9_-]+)$/i).exec(rawMulti);
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
	currentLocation: {
		name: 'When browsing in location',
		defaultTemplate(patt) {
			return { type: 'currentLocation', patt: patt || this.getCurrent() };
		},
		fields: [
			'when browsing',
			{ type: 'text', id: 'patt', validator: RegExp },
		],
		evaluate(thing, data) {
			return this.getCurrent() === data.patt;
		},
		getCurrent() {
			const regex = Object.keys(regexes).find(key => location.pathname.match(regexes[key]));
			if (!regex) return location.pathname;

			// examples: domain-youtube.com, user-gueor, subreddit-enhancement+resissues
			return escapeStringRegexp(
				[
					regex,
					...(location.pathname.match(regexes[regex]) || []).slice(1), // ignore matched string
				]
					.filter(v => v)
					.join('-')
			);
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
};

const postCases = {
	subreddit: {
		name: 'Subreddit',
		trueText: 'in',
		falseText: '¬ in',
		defaultTemplate(patt) {
			return { type: 'subreddit', patt: patt || '' };
		},
		fields: [
			'posted in /r/', { type: 'text', id: 'patt', validator: RegExp },
		],
		evaluate(thing, data) {
			const subreddit = thing.getSubreddit();
			if (!subreddit) return false;

			const pattern = new RegExp(`^(${data.patt})$`, 'i');
			return pattern.test(subreddit.trim());
		},
		parse(input) { return this.defaultTemplate(input); },
		fromSelected(thing) { return escapeStringRegexp(thing.getSubreddit()); },
	},
	commentCount: {
		name: 'Comment count',
		trueText: 'comment count ≥',
		falseText: 'comment count <',
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
			return isNaN(commentCount) ? false : numericalCompare(data.op, commentCount, data.val);
		},
		parse(input) {
			const commentCount = parseInt(input, 10);
			return isNaN(commentCount) ? false : this.defaultTemplate('>=', commentCount);
		},
		fromSelected(thing) { return thing.getCommentCount(); },
	},
	score: {
		name: 'Score',
		trueText: 'score ≥',
		falseText: 'score <',
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
			return isNaN(score) ? null : numericalCompare(data.op, score, data.val);
		},
		parse(input) {
			const score = parseInt(input, 10);
			return isNaN(score) ? null : this.defaultTemplate('>=', score);
		},
		fromSelected(thing) { return thing.getScore(); },
	},
	username: {
		name: 'Username',
		trueText: 'by',
		falseText: '¬ by',
		defaultTemplate(patt) {
			return { type: 'username', patt: patt || '' };
		},
		fields: [
			'posted by /u/', { type: 'text', id: 'patt', validator: RegExp },
		],
		evaluate(thing, data) {
			const user = thing.getAuthor();
			if (!user) return false;

			const pattern = new RegExp(`^(${data.patt})$`, 'i');
			return pattern.test(user);
		},
		parse(input) { return this.defaultTemplate(input); },
		fromSelected(thing) { return escapeStringRegexp(thing.getAuthor()); },
	},
	userAttr: {
		name: 'User attribute (friend/mod/etc...)',
		trueText: 'user attribute',
		falseText: '¬ user attribute',
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
				if (!myName) return false;

				const author = thing.getAuthor().toLowerCase();
				myName = myName.trim().toLowerCase();

				return author === myName;
			} else {
				// The other cases have hardcoded class names
				const element = thing.getAuthorElement();
				return element.classList.contains(data.attr);
			}
		},
		pattern: 'x — where x is any of the following: friend, moderator, admin',
		parse(input) { return this.defaultTemplate(input); },
	},
	userFlair: {
		name: 'User flair',
		trueText: 'user flair',
		falseText: '¬ user flair',
		defaultTemplate(patt) {
			return { type: 'userFlair', patt: patt || '' };
		},
		fields: [
			'author of this post has flair matching ',
			{ type: 'text', id: 'patt', validator: RegExp },
		],
		evaluate(thing, data) {
			const text = thing.getUserFlairText();
			if (!text) return false;

			const pattern = new RegExp(`^(${data.patt})$`, 'i');
			return pattern.test(text);
		},
		parse(input) { return this.defaultTemplate(input); },
		fromSelected(thing) { return thing.getUserFlairText(); },
	},
	domain: {
		name: 'Link domain name',
		trueText: 'domain',
		falseText: '¬ domain',
		defaultTemplate(dom) {
			return { type: 'domain', patt: dom || '' };
		},
		fields: [
			'post links to the domain ',
			{ type: 'text', id: 'patt', validator: RegExp },
		],
		evaluate(thing, data) {
			const domain = thing.getPostDomain();
			if (!domain) return false;

			const pattern = new RegExp(`^(${data.patt})$`, 'i');
			return pattern.test(domain);
		},
		parse(input) { return this.defaultTemplate(input); },
		fromSelected(thing) { return escapeStringRegexp(thing.getPostDomain()); },
	},
	linkFlair: {
		name: 'Link flair',
		trueText: 'link flair',
		falseText: '¬ link flair',
		defaultTemplate(patt) {
			return { type: 'linkFlair', patt: patt || '' };
		},
		fields: [
			'post has link flair matching ',
			{ type: 'text', id: 'patt', validator: RegExp },
		],
		evaluate(thing, data) {
			const text = thing.getPostFlairText();
			if (!text) return false;

			const pattern = new RegExp(`^(${data.patt})$`, 'i');
			return pattern.test(text.trim());
		},
		parse(input) { return this.defaultTemplate(input); },
		fromSelected(thing) { return escapeStringRegexp(thing.getPostFlairText()); },
	},
	postAge: {
		name: 'Post age',
		defaultTemplate(op, age) {
			// 4 hours in milliseconds
			return { type: 'postAge', op, age: age || 4 * 60 * 60 * 1000 };
		},
		trueText: 'age ≤',
		falseText: 'age >',
		fields: [
			'post is ',
			{ type: 'select', options: 'COMPARISON', id: 'op' },
			' ', { type: 'duration', id: 'age' }, ' old',
		],
		evaluate(thing, data) {
			const postTime = thing.getTimestamp();
			if (!postTime) return false;

			const now = new Date();
			return numericalCompare(data.op, now - postTime, data.age);
		},
		pattern: 'x(Y|M|d|h|m)? - where x is the number of seconds or Y year, M month, h hour, m minute (case sensitive)',
		qualifiers: [['Y', 12], ['M', 30.44], ['d', 24], ['h', 60], ['m', 60], ['s', 1000]],
		parse(input) {
			let age = parseFloat(input, 10);
			if (isNaN(age)) return null;

			const ageQualifier = _.head(input.match(/Y|M|d|h|m|s/)) || 's';
			const qualifiers = _.clone(this.qualifiers);
			let qualifier, multiplier;
			do {
				[qualifier, multiplier] = qualifiers.pop();
				age *= multiplier;
			} while (ageQualifier !== qualifier && qualifiers.length);

			return this.defaultTemplate('<=', age);
		},
		fromSelected(thing) {
			let remainder = (new Date() - new Date(thing.getTimestamp()));
			if (isNaN(remainder)) return null;

			let remainderQualifier = 'ms';
			const qualifiers = _.clone(this.qualifiers);
			do {
				const [qualifier, multiplier] = qualifiers.pop();
				if (remainder < multiplier) return remainder.toFixed(2) + remainderQualifier;
				remainder /= multiplier;
				remainderQualifier = qualifier;
			} while (qualifiers.length);
		},
	},
	postAfter: {
		name: 'Post after',
		trueText: 'after',
		falseText: 'before',
		defaultTemplate(patt) {
			return { type: 'postAfter', patt: patt || '' };
		},
		fields: [
			'posted after date ',
			{ type: 'text', id: 'patt', validator: v => { if (isNaN(Date.parse(v))) throw Error('Could\'t parse'); } },
		],
		evaluate(thing, data) {
			const postTime = thing.getTimestamp();
			if (!postTime) return false;

			return postTime && postTime >= new Date(data.patt);
		},
		pattern: 'A string representing a RFC2822 or ISO 8601 date',
		parse(input) {
			const date = Date.parse(input);
			return isNaN(date) ? null : this.defaultTemplate(input);
		},
		fromSelected(thing) { return thing.getTimestamp().toISOString(); },
	},
	postTitle: {
		name: 'Post title',
		trueText: 'title contains',
		falseText: '¬ title contains',
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
		parse(input) { return this.defaultTemplate(input); },
	},
	postType: {
		name: 'Post type',
		trueText: 'type',
		falseText: '¬ type',
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
				case 'link':    return thing.isLinkPost();
				case 'self':    return thing.isSelfPost();
				default: return false;
			}
		},
		pattern: 'x — where x is any of the following: comment, link, self',
		parse(input) { return this.defaultTemplate(input); },
	},
	isNSFW: {
		name: 'NSFW post',
		unique: true,
		trueText: 'nsfw',
		falseText: '¬ nsfw',
		get alwaysShow() { return !module.options.NSFWfilter.value; },
		defaultTemplate() {
			return { type: 'isNSFW' };
		},
		fields: [
			'post is marked NSFW',
		],
		evaluate(thing) {
			return thing.isNSFW();
		},
		parse() { return this.defaultTemplate(); },
	},
	isVisited: {
		/* Not available for Safari and Edge, as they lack isURLVisited */
		name: 'visited',
		unique: true,
		trueText: 'visited',
		falseText: '¬ visited',
		defaultTemplate() {
			return { type: 'isVisited' };
		},
		fields: [
			'post link has not been visited',
		],
		disabled: process.env.BUILD_TARGET === 'safari' || process.env.BUILD_TARGET === 'edge',
		get alwaysShow() { return !this.disabled; },
		async evaluate(thing) {
			const link = thing.getPostLink();
			return link && isURLVisited(link.href);
		},
		async: true,
		parse() { return this.defaultTemplate(); },
	},
	commentsOpened: {
		/* Not available for Safari and Edge, as they lack isURLVisited */
		name: 'Comments opened',
		unique: true,
		trueText: 'comments opened',
		falseText: '¬ comments opened',
		defaultTemplate() {
			return { type: 'commentsOpened' };
		},
		fields: [
			'comment link has not been visited',
		],
		disabled: process.env.BUILD_TARGET === 'safari' || process.env.BUILD_TARGET === 'edge',
		get alwaysShow() { return !this.disabled; },
		async evaluate(thing) {
			const link = thing.getCommentsLink();
			return link && isURLVisited(link.href);
		},
		async: true,
		parse() { return this.defaultTemplate(); },
	},
	hasExpando: {
		name: 'Has expando',
		trueText: 'has expando',
		falseText: '¬ has expando',
		defaultTemplate(patt) {
			return { type: 'hasExpando', patt: patt || '' };
		},
		fields: [
			'Post has expando, or must match one of the following types: ',
			{ type: 'text', id: 'patt', validator: RegExp },
		],
		alwaysShow: true,
		evaluate(thing, data) {
			const types = data.patt.toLowerCase().split(' ').filter(v => v);

			const expando = thing.getEntryExpando();

			if (!types.length || !expando) {
				return !!expando;
			} else {
				return !!_.intersection(expando.getTypes(), types).length;
			}
		},
		async: true, // Because of updateOnNewExpando
		pattern: 'x1, x2, …, xn  — where x is any of type (selftext, video, image, iframe, gallery, native, …)',
		parse(input) { return this.defaultTemplate(input); },
		fromSelected(thing) {
			const expando = thing.getEntryExpando();
			return expando && expando.getTypes().join(' ') || '';
		},
		onChange({ remove }) {
			// refresh the things separately when completed
			this.updateOnNewExpando = this.updateOnNewExpando ||
				(thing => this.parent.refreshThing(thing, this));
			if (remove || this.state === null) {
				ShowImages.thingExpandoBuildListeners.remove(this.updateOnNewExpando);
			} else {
				ShowImages.thingExpandoBuildListeners.add(this.updateOnNewExpando);
			}
		},
	},
};

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
let restorePage;

module.beforeLoad = async () => {
	updateNsfwBodyClass(module.options.NSFWfilter.value);

	restorePage = browseContexts.currentLocation.getCurrent();

	console.log(restorePage);

	filterlineKey = `RESmodules.filteReddit.${restorePage.toLowerCase()}`;

	filterlineState = await Storage.get(filterlineKey);
	initialFilterlineVisibility = module.options.showFilterline.value || (filterlineState && filterlineState.active);

	if (initialFilterlineVisibility) {
		// Pad the space where the filterline will be shown, so that it won't push `siteTable` down when initialized
		BodyClasses.toggle(true, 'res-filteReddit-filterline-pad-until-ready');
	}
};

const $nsfwSwitch = _.once(() => $(CreateElement.toggleButton(undefined, 'nsfwSwitchToggle', module.options.NSFWfilter.value)));
const things = new Set();

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
			things.add(thing);
			filterline.refreshThing(thing);
			updateNsfwThingClass(thing);
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

			filterline.addChoice(options);
			if (options.alwaysShow) filterline.createFilterFromKey(key, { add: true, id: key });
		}
	}

	const completeFilterline = _.once(() => {
		addPostCaseFilters();
		if (filterlineState) filterline.restoreState(filterlineState);
		filterline.createElement();
	});

	const filterlineTab = CreateElement.tabMenuItem({
		text: '∀',
		title: 'Toggle filterline',
		className: 'res-toggle-filterline-visibility',
	});

	let active;

	filterlineTab.addEventListener('change', e => {
		active = e.detail;

		if (active) {
			completeFilterline();
			filterlineTab.removeAttribute('aftercontent');
		} else {
			const anyCustomFiltersEnabled = filterline.getActiveFilters().find(v => !(v instanceof ExternalFilter));
			filterlineTab.setAttribute('aftercontent', anyCustomFiltersEnabled ? ' (active)' : '');
		}

		Storage.patch(filterlineKey, { active });
		BodyClasses.toggle(active, 'res-filteReddit-show-filterline');
	});

	addExternalFilters();

	// When using the command line, show the filterline
	filterline.registerCommand(() => { if (!active) filterlineTab.click(); });

	if (initialFilterlineVisibility) {
		filterlineTab.click();
		BodyClasses.toggle(false, 'res-filteReddit-filterline-pad-until-ready');
	}

	return filterline;
}

class Filter {
	disabled = false;
	matchesCount = 0;
	state = null; // FilterState
	criterion = null; // ?string;

	id // string;
	key // string;

	parse // ?Function;
	parsed // ?Object;
	evaluate // Function;

	parent // Filterline;

	clearCache // ?Function;
	fromSelected // ?Function;
	onChange // ?Function;

	settingsHtml // ?string;
	alwaysShow // ?boolean;
	pattern // ?string;

	trueText // string;
	falseText // string;

	element // ?HTMLElement;
	inner // ?HTMLElement;

	constructor(options, id) {
		// An id is necessary when saving / removing
		this.id = id || randomHash();

		Object.assign(this, options);

		this.createElement();
		this.updateMatchesCount();
	}

	createElement() {
		this.element = $(filterlineFilterTemplate(this))[0];
		this.inner = this.element.querySelector('.res-filterline-filter-name');
		this.refreshElement();

		this.element.addEventListener('click', () => {
			this.update(this.getNextState());
		});

		this.element.addEventListener('contextmenu', e => { // Right click
			// Destroy / reset filter
			this.update(null, null);
			e.preventDefault(); // Do not show context menu
		});
	}

	refreshElement() {
		this.inner.setAttribute('name', this.getStateName());

		if (this.criterion) this.inner.setAttribute('criterion', this.criterion);
		else this.inner.removeAttribute('criterion');

		this.element.classList.toggle('res-filterline-filter-active', this.state !== null);
	}

	getNextState() {
		if (this.state === null) return true; // Active inverse -- hide those that match
		if (this.state === true) return false; // Active -- hide those that  don't match
		if (this.state === false) return null; // Inactive -- disregard filter
	}

	getStateName() {
		return this.state === false ? this.falseText : this.trueText;
	}

	getInvertedStateName() {
		return this.state === false ? this.trueText : this.falseText;
	}

	save() {
		Storage.patch(
			filterlineKey,
			{ filters: { [this.id]: _.pick(this, ['state', 'criterion', 'key']) } }
		);
	}

	delete() {
		this.element.remove();
		Storage.deletePath(filterlineKey, 'filters', this.id);
	}

	update(state, criterion, { save = true } = {}) {
		this.state = state;

		if (criterion !== undefined && criterion !== this.criterion) {
			if (this.parse.length) this.criterion = criterion;
			else if (criterion) console.log('Filter does not support criterion. Ignoring criterion');
			this.parsed = this.parse(criterion);
		} else if (!this.parsed) {
			this.parsed = this.parse(criterion);
		}

		this.parent.updateFilter(this);
		// Remove if filter is no longer used by parent
		const remove = !this.parent.filters.includes(this);

		if (remove) this.delete();
		else if (save) this.save();

		this.refreshElement();

		if (this.onChange) this.onChange({ remove });
	}

	updateFromSelectedEntryValue(reverseActive) {
		const selected = SelectedEntry.selectedThing();
		const criterion = this.fromSelected(selected);

		try {
			if (criterion === null) throw new Error('Could not retrieve selected entry\'s value');

			const state = this.evaluate(selected, this.parse(criterion));
			if (state === null) throw new Error('Could not evaluate selected entry\'s value');
			else this.update(reverseActive ? !state : state, criterion);
		} catch (e) {
			console.error(e);

			Notifications.showNotification({
				moduleID: module.moduleID,
				notificationID: 'selectedEntry value parse error',
				message: `Selected entry's ${this.key} value is invalid; ignoring`,
			});

			this.update(null, null);
		}
	}

	updateByInputConstruction({ criterion, clearCriterion, reverseActive, fromSelected }) {
		if (clearCriterion) {
			this.update(this.state, null);
			return;
		} else if (fromSelected && this.fromSelected) {
			this.updateFromSelectedEntryValue(reverseActive);
			return;
		}

		const state = reverseActive ? new Map([[false, true], [null, false], [true, false]]).get(this.state) :
			new Map([[false, false], [null, true], [true, false]]).get(this.state) ||
			criterion ? true : null;

		if (criterion) {
			this.update(state, criterion);
		} else {
			this.update(state);
		}
	}

	updateMatchesCount(delta = 0) {
		this.matchesCount += delta;
		this.element.title = `${this.state === null ? 'Inactive' : 'Active'} — filters ${this.matchesCount} posts`;

		if (this.element) {
			if (this.matchesCount) this.element.setAttribute('matches-count', this.matchesCount);
			else this.element.removeAttribute('matches-count');
		}
	}

	async matchesFilter(thing, mutateThingWithResult) {
		const result = await this.evaluate(thing, this.parsed);
		if (mutateThingWithResult) thing.filterResult = result;
		return this.state === !result;
	}

	setThingFilterReason(thing) {
		thing.element.setAttribute(
			'filter-reason',
			`${this.getInvertedStateName()} ${this.criterion ? ` ${this.criterion}` : ''}`
		);
	}

	removeThingFilterReason(thing) {
		thing.element.removeAttribute('filter-reason');
	}
}

class ExternalFilter extends Filter {
	createElement() {
		this.element = $(filterlineExternalFilterTemplate(this))[0];
	}

	removeFilterEntry(entry) {
		const newValueArray = _.pull(module.options[this.key].value, entry);
		Options.set(module, this.key, newValueArray);
		if (this.clearCache) this.clearCache();
		this.parent.updateFilter(this);
	}

	setThingFilterReason(thing) {
		thing.element.setAttribute('filter-reason', `specified by filter ${this.key}`);
		thing.filterEntryRemover = $('<span>', {
			class: 'res-filter-remove-entry',
			title: JSON.stringify(thing.filterResult, null, '  '),
			click: () => this.removeFilterEntry(thing.filterResult),
		}).prependTo(thing.element);
	}

	removeThingFilterReason(thing) {
		thing.element.removeAttribute('filter-reason');
		if (thing.filterEntryRemover) thing.filterEntryRemover.remove();
	}
}

class Filterline {
	filters = [];
	filterChoices = {};
	hiddenThings = [];
	showFilterReason = false;

	drowdown // ?HTMLElement
	filterContainer // ?HTMLElement
	otherContainer // ?HTMLElement
	externalContainer // ?HTMLElement

	createElement() {
		const $element = $(filterlineTemplate());
		const element = $element[0];
		this.filterContainer = element.querySelector('.res-filterline-filters');
		this.externalContainer = element.querySelector('.res-filterline-external');
		this.otherContainer = element.querySelector('.res-filterline-other');

		this.addFilterElements(this.filters);

		this.dropdown = element.querySelector('.res-filterline-dropdown');
		waitForEvent(this.dropdown, 'mouseenter').then(::this.createDropdown);

		$element.insertBefore(document.querySelector('#siteTable, .search-result-listing'));
	}

	addFilterElements(filters) {
		for (const filter of filters) {
			const container = (filter instanceof ExternalFilter) ? this.externalContainer : this.filterContainer;
			container.appendChild(filter.element);
		}
	}

	createDropdown() {
		for (const { options } of Object.values(this.filterChoices)) {
			if (options.alwaysShow && options.unique) continue; // Filter already available

			this.createChoiceElement(options);
		}

		this.dropdown.querySelector('.res-filterline-export-customfilters')
			.addEventListener('click', ::this.exportToCustomFilters);

		const showFilterReasonCheckbox = this.dropdown.querySelector('.res-filterline-show-reason input');
		showFilterReasonCheckbox.addEventListener('change', () => {
			this.showFilterReason = showFilterReasonCheckbox.checked;
			this.refreshAllFilterReasons();
			document.body.classList.toggle('res-show-filter-reason', this.showFilterReason);
		});

		const hideCheckbox = this.dropdown.querySelector('.res-filterline-hide-filtered input');
		hideCheckbox.addEventListener('change', async () => {
			hideCheckbox.disabled = true;
			await (hideCheckbox.checked ? this.hide() : this.unhide());
			hideCheckbox.disabled = false;
		});
	}

	getFiltered() {
		return Array.from(things).filter(thing => thing.filter);
	}

	async hide() {
		const things = this.getFiltered();
		this.hiddenThings.push(...things);

		await things.map(thing => hide(thing));

		Notifications.showNotification({
			moduleID: module.moduleID,
			notificationID: 'hideThings',
			message: `Reddit has now hidden ${things.length} things. Undo by unchecking the checkbox. If you want to hide additional things, you need to reload this page.`,
		});
	}

	async unhide() {
		const things = this.hiddenThings.splice(0);
		await things.map(thing => unhide(thing));

		Notifications.showNotification({
			moduleID: module.moduleID,
			notificationID: 'unhideThings',
			message: `${things.length} things are no longer hidden.`,
		});
	}

	exportToCustomFilters() {
		const encapsulate = (op, ...conditions) => ({
			of: conditions,
			op,
			type: 'group',
		});

		const conditions = this.filters
			.filter(v => module.options.customFilters.cases.hasOwnProperty(v.key))
			.filter(v => v.state !== null && v.parsed);

		if (!conditions.length) {
			Notifications.showNotification({
				moduleID: module.moduleID,
				notificationID: 'exportToCustomFilters no conditions',
				header: 'Could not find any conditions to export',
				message: 'Note that customFilters does not support "isVisited", "hasExpando", and "commentsOpened" since those are asynchronous.',
			});
			return;
		}

		const customFilter = {
			body: encapsulate(
				'all',
				browseContexts.currentLocation.defaultTemplate(),
				encapsulate('any', ...conditions.map(v => v.state ? encapsulate('none', v.parsed) : v.parsed))
			),
			note: '',
			ver: 1,
		};

		Options.set(module, 'customFilters', [customFilter]);
		SettingsNavigation.loadSettingsPage(module.moduleID, 'customFilters');

		// No need to show the filters anymore in the filterline
		for (const filter of conditions) filter.update(null, null);
	}

	async restoreState({ filters = {} }) {
		for (const [id, { key, state, criterion }] of Object.entries(filters)) {
			let filter;
			try {
				filter = this.filters.find(v => v.id === id) ||
					this.createFilterFromKey(key, { add: true, id });
				filter.update(state, criterion, { save: false });
			} catch (e) {
				console.error(e);
				console.error(`Could not restore filter ${key}; deleting`);
				if (filter) filter.delete();
			}
		}
	}

	findFilterInputError(filter, { criterion, asNewFilter, fromSelected }) {
		if (asNewFilter) {
			if (filter.unique && this.filterChoices[filter.key].activeFilters.length) {
				return 'Unique filters may only be applied once.';
			}
		}

		if (fromSelected) {
			if (!filter.fromSelected) {
				return 'Filter does not support selected entry data extraction.';
			}

			if (!SelectedEntry.selectedThing()) {
				return 'No entry is currently selected.';
			}
		}

		if (criterion) {
			if (filter.parse(criterion) === null) {
				return 'Criterion could not be parsed.';
			}
		}
	}

	registerCommand(beforeTip) {
		const modifiersInfo =
			`Modifiers:
				/	 — clear the filter current criterion
				!	 — reverse the active state
				+	 — create as new filter
				=	 — use the currently selected entry's data as criterion`
			.split('\n');

		const deconstruct = val => {
			// Example: "!expando image" → { reverseActive: true, key: "expando", criterion: "image" }
			const [, modifiers, key, criterion] = val.match(/^([^\w]*)(\w*)(.*)/);
			return {
				key,
				criterion: criterion.trim(),
				clearCriterion: !!modifiers.match('/'),
				reverseActive: !!modifiers.match('!'),
				asNewFilter: !!modifiers.match('\\+'),
				fromSelected: !!modifiers.match('='),
			};
		};

		const findMatchingKeys = val => Object.keys(this.filterChoices)
			.filter(v => v.toLowerCase().match(val.toLowerCase()))
			.sort();

		let filter;

		CommandLine.registerCommand(/(fl|filterline)/, 'fl - modify filterline',
			(cmd, val) => {
				beforeTip();

				const deconstructed = deconstruct(val);
				const { key, asNewFilter } = deconstructed;
				const matchingKeys = findMatchingKeys(key);

				const message = [];

				if (matchingKeys.length === 1) {
					const key = matchingKeys[0];

					if (!filter || filter.key !== key) {
						const choice = this.filterChoices[key];
						const lastFilter = _.last(choice.activeFilters);

						if (lastFilter && !asNewFilter) filter = lastFilter;
						else filter = this.createFilterFromKey(key);
					}

					const errorMessage = this.findFilterInputError(filter, deconstructed);

					if (errorMessage) message.push(`Error: ${errorMessage}`);
					message.push(`- ${key} ${filter.pattern || ''}`);
				} else {
					const keys = matchingKeys.length ? matchingKeys : findMatchingKeys('');
					filter = null;

					message.push(...keys.map(key => `- ${key} ${this.filterChoices[key].options.pattern || ''}`));
				}

				message.push('', ...modifiersInfo);
				return message.join('<br>');
			},
			(cmd, val) => {
				if (!filter) return;
				this.addFilter(filter);
				filter.updateByInputConstruction(deconstruct(val));
			}
		);
	}

	addChoice(options) {
		this.filterChoices[options.key] = {
			options,
			activeFilters: [],
		};
	}

	createChoiceElement(options) {
		const choice = $(`<div class='res-filterline-filter-new res-filterline-filter'>${options.name}</div>`)
			.appendTo(this.otherContainer)
			.click(() => {
				function getCriterionInput() {
					let value = null;

					do {
						const question = `Enter criterion(s) for ${filter.key}:`;
						const pattern = options.pattern ? `\npattern: ${filter.pattern}` : '';
						const previous = value !== null ? '\n(previous input was invalid)' : '';
						value = window.prompt(`${question}${pattern}${previous}`, value || '');

						if (filter.parse(value) !== null) return value;
					} while (value !== null);
				}

				const filter = this.createFilterFromKey(options.key);
				let criterion = null;

				if (filter.parse.length) {
					criterion = getCriterionInput();
					if (criterion === null) return;
				}

				this.addFilter(filter);
				filter.updateByInputConstruction({ criterion });
			});

		if (options.fromSelected) {
			$('<div class=\'res-filterline-filter-new-from-selected\' title=\'From selected entry\'></div>')
				.click(e => {
					e.stopPropagation();

					const filter = this.createFilterFromKey(options.key, { add: true });
					filter.updateByInputConstruction({ fromSelected: true });
				})
				.appendTo(choice);
		}
	}

	createFilterFromKey(key, { add, id } = {}) {
		const choice = this.filterChoices[key];

		if (choice.options.unique && choice.activeFilters.length) throw new Error('Cannot create new instances of unique filter');

		const filter = new Filter(choice.options, id);

		if (add) this.addFilter(filter);

		return filter;
	}

	addFilter(filter) {
		filter.parent = this;

		// Place async filters at end of array in order to have sync (quicker) filters tested first
		if (filter.async) this.filters.push(filter);
		else this.filters.unshift(filter);

		if (this.filterContainer) this.addFilterElements([filter]);

		const choice = this.filterChoices[filter.key];
		if (choice) choice.activeFilters.push(filter);
	}

	updateFilter(filter) {
		this.refreshAll(filter);

		// Check if filter can be removed
		const choice = this.filterChoices[filter.key];
		if (
			choice && (!choice.options.alwaysShow || choice.activeFilters.length > 1) &&
			filter.state === null && filter.criterion === null
		) {
			_.pull(this.filters, filter);
			_.pull(choice.activeFilters, filter);
		}
	}

	getActiveFilters() {
		return this.filters.filter(v => v.state !== null);
	}

	getFilterPosition(filter) {
		return this.filters.indexOf(filter);
	}

	getUpdateRange(currentFilter, invokedByFilter) {
		let fromIndex = 0;
		let toIndex; // Undefined → the natural limit of the array

		if (invokedByFilter) {
			const invokedByFilterIndex = this.getFilterPosition(invokedByFilter);
			const currentFilterIndex = this.getFilterPosition(currentFilter);

			if (currentFilterIndex === -1) {
				// No other filters did match last time; only retest this
				fromIndex = invokedByFilterIndex;
				toIndex = fromIndex + 1;
			} else if (currentFilterIndex === invokedByFilterIndex) {
				// The invokedBy filter matched last time; start testing from that one
				fromIndex = invokedByFilterIndex;
			} else if (currentFilterIndex > invokedByFilterIndex) {
				// Only retest the invoked one, so that thing.filter always refers to the first matched filter
				fromIndex = currentFilterIndex;
				toIndex = fromIndex + 1;
			} else {
				// Some other filters matched; ignore
				return null;
			}
		}

		return { fromIndex, toIndex };
	}

	async refreshThing(thing, invokedByFilter) {
		const updateRange = this.getUpdateRange(thing.filter, invokedByFilter);
		if (!updateRange) return;

		// Do not apply any other filters if posts belong to me
		if (
			module.options.excludeOwnPosts.value &&
			loggedInUser() && loggedInUser() === thing.getAuthor()
		) return;

		const matchedFilter = await this.filters.slice(updateRange.fromIndex, updateRange.toIndex)
			::asyncFind(v => v.state !== null && v.matchesFilter(thing, true));

		if (thing.filter !== matchedFilter) {
			if (matchedFilter) matchedFilter.updateMatchesCount(1);
			if (thing.filter) thing.filter.updateMatchesCount(-1);

			this.updateThingFilterReason(thing, thing.filter, matchedFilter);
			thing.element.classList.toggle('RESFiltered', !!matchedFilter);

			if (matchedFilter && SelectedEntry.selectedThing() === thing) {
				SelectedEntry.selectClosestVisible({ scrollStyle: 'none' });
			}

			ShowImages.refresh();

			thing.filter = matchedFilter;
		}
	}

	refreshAll(invokedByFilter) {
		for (const thing of things) this.refreshThing(thing, invokedByFilter);
	}

	updateThingFilterReason(thing, previousMatch, currentMatch) {
		if (previousMatch) previousMatch.removeThingFilterReason(thing);

		if (currentMatch) {
			if (this.showFilterReason) currentMatch.setThingFilterReason(thing);
			else currentMatch.removeThingFilterReason(thing);
		}
	}

	refreshAllFilterReasons() {
		for (const thing of things) this.updateThingFilterReason(thing, null, thing.filter);
	}
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
		const [matchString, applyTo = 'everyhere', applyList = '', except = ''] = Array.isArray(source) ? source : [source];

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
