/* @flow */

import _ from 'lodash';
import escapeStringRegexp from 'escape-string-regexp';
import {
	loggedInUser,
} from '../../utils';
import * as ShowImages from '../showImages';
import * as FilteReddit from '../filteReddit';
import { isURLVisited } from '../../environment';

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

export default ({
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
		pattern: 'RegEx',
		parse(input) { return (input && input.length) ? this.defaultTemplate(input) : null; },
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
		pattern: 'integer',
		parse(input) {
			const commentCount = parseInt(input, 10);
			return isNaN(commentCount) ? null : this.defaultTemplate('>=', commentCount);
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
		pattern: 'integer',
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
		pattern: 'RegEx',
		parse(input) { return (input && input.length) ? this.defaultTemplate(input) : null; },
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
		pattern: '(friend|moderator|admin)',
		parse(input) { return (input && input.length) ? this.defaultTemplate(input) : null; },
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
		pattern: '[RegEx]',
		parse(input) { return this.defaultTemplate(input || '.*'); },
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
		pattern: 'RegEx',
		parse(input) { return (input && input.length) ? this.defaultTemplate(input) : null; },
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
		pattern: '[RegEx]',
		parse(input) { return this.defaultTemplate(input || '.*'); },
		fromSelected(thing) { return escapeStringRegexp(thing.getPostFlairText()); },
	},
	postAge: {
		name: 'Post age',
		defaultTemplate(op, age) {
			// 4 hours in milliseconds
			return { type: 'postAge', op: op || '<=', age: age || 4 * 60 * 60 * 1000 };
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
		pattern: 'x[(Y|M|d|h|m)] — where x is the number of seconds or Y year, M month, h hour, m minute (case sensitive)',
		qualifiers: [['Y', 12], ['M', 30.44], ['d', 24], ['h', 60], ['m', 60], ['s', 1000]],
		parse(input) {
			let age = parseFloat(input, 10);
			if (isNaN(age)) return null;

			const ageQualifier = _.head(input.match(/Y|M|d|h|m|s/)) || 's';
			age = _.dropWhile(this.qualifiers, ([qualifier]): * => qualifier !== ageQualifier)
				.reduce((a, [, multiplier]) => a * multiplier, age);

			return this.defaultTemplate('<=', age);
		},
		fromSelected(thing) {
			let remainder = (new Date() - new Date(thing.getTimestamp()));
			if (isNaN(remainder)) return null;

			let remainderQualifier = '';
			for (const [qualifier, multiplier] of this.qualifiers.slice().reverse()) {
				if (remainder < multiplier) return remainder.toFixed(2) + remainderQualifier;
				remainder /= multiplier;
				remainderQualifier = qualifier;
			}
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
			return postTime && postTime >= new Date(data.patt) || false;
		},
		pattern: 'Date — string representing a RFC2822 or ISO 8601 date',
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
		pattern: 'RegEx',
		parse(input) { return (input && input.length) ? this.defaultTemplate(input) : null; },
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
		pattern: '(comment|link|self)',
		parse(input) { return this.defaultTemplate(input); },
	},
	isNSFW: {
		name: 'NSFW post',
		unique: true,
		trueText: 'nsfw',
		falseText: '¬ nsfw',
		get alwaysShow() { return !FilteReddit.module.options.NSFWfilter.value; },
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
		evaluate(thing) {
			const link = thing.getPostLink();
			return link && isURLVisited(link.href) || false;
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
		evaluate(thing) {
			const link = thing.getCommentsLink();
			return link && isURLVisited(link.href) || false;
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
			const expando = thing.getEntryExpando();
			return expando && ShowImages.matchesTypes(expando.getTypes(), data.patt.toLowerCase().split(' ').filter(v => v)) || false;
		},
		async: true, // Because of updateOnNewExpando
		pattern: '[(selftext|video|image|iframe|gallery|native|muted|non-muted)] — zero or more space separated types',
		parse(input) { return this.defaultTemplate(input || 'any'); },
		fromSelected(thing) {
			const expando = thing.getEntryExpando();
			return expando && expando.getTypes().join(' ') || undefined;
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
}: *);
