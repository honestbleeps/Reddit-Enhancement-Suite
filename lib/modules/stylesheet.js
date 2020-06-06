/* @flow */

import $ from 'jquery';
import { difference } from 'lodash-es';
import { Module } from '../core/module';
import {
	BodyClasses,
	currentMultireddit,
	currentSubreddit,
	currentUserProfile,
	filterMap,
	loggedInUser,
	string,
} from '../utils';
import * as CustomToggles from './customToggles';

export const module: Module<*> = new Module('stylesheet');

module.moduleName = 'stylesheetName';
module.description = 'stylesheetDesc';
module.category = 'appearanceCategory';
module.exclude = [
	'prefs',
	'account',
	'stylesheet',
	'subredditAbout',
];

module.options = {
	redditThemes: {
		title: 'stylesheetRedditThemesTitle',
		description: 'stylesheetRedditThemesDesc',
		type: 'button',
		text: 'learn more',
		callback() {
			window.location.href = 'https://www.reddit.com/r/Enhancement/wiki/faq/srstyle#reddit_themes';
		},
	},
	loadStylesheets: {
		title: 'stylesheetLoadStylesheetsTitle',
		type: 'table',
		description: 'stylesheetLoadStylesheetsDesc',
		value: ([
			// loading stylesheets is expensive for reddit (#4302), so this should not have a default value
		]: Array<[string, string, string, string]>),
		fields: [{
			key: 'urlOrSubreddit',
			name: 'url or subreddit',
			type: 'text',
		}, {
			key: 'applyTo',
			name: 'applyTo',
			type: 'select',
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
			key: 'applyToSubreddits',
			name: 'applyToSubreddits',
			type: 'list',
			listType: 'subreddits',
		}, {
			key: 'customToggle',
			name: 'customToggle',
			type: 'select',
			get values() { return getToggles(); },
			value: '',
		}],
	},
	snippets: {
		title: 'stylesheetSnippetsTitle',
		type: 'table',
		description: 'stylesheetSnippetsDesc',
		value: ([]: Array<[string, string, string, string]>),
		fields: [{
			key: 'snippet',
			name: 'snippet',
			type: 'textarea',
		}, {
			key: 'applyTo',
			name: 'applyTo',
			type: 'select',
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
			key: 'applyToSubreddits',
			name: 'applyToSubreddits',
			type: 'list',
			listType: 'subreddits',
		}, {
			key: 'customToggle',
			name: 'customToggle',
			type: 'select',
			get values() { return getToggles(); },
			value: '',
		}],
	},
	bodyClasses: {
		title: 'stylesheetBodyClassesTitle',
		type: 'table',
		description: 'stylesheetBodyClassesDesc',
		value: ([]: Array<[string, string, string, string]>),
		fields: [{
			key: 'classes',
			name: 'classes',
			type: 'text',
		}, {
			key: 'applyTo',
			name: 'applyTo',
			type: 'select',
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
			key: 'applyToSubreddits',
			name: 'applyToSubreddits',
			type: 'list',
			listType: 'subreddits',
		}, {
			key: 'customToggle',
			name: 'customToggle',
			type: 'select',
			get values() { return getToggles(); },
			value: '',
		}],
	},
	subredditClass: {
		title: 'stylesheetSubredditClassTitle',
		type: 'boolean',
		value: true,
		description: 'stylesheetSubredditClassDesc',
	},
	multiredditClass: {
		title: 'stylesheetMultiredditClassTitle',
		type: 'boolean',
		value: true,
		description: 'stylesheetMultiredditClassDesc',
	},
	usernameClass: {
		title: 'stylesheetUsernameClassTitle',
		type: 'boolean',
		value: true,
		description: 'stylesheetUsernameClassDesc',
	},
	loggedInUserClass: {
		title: 'stylesheetLoggedInUserClassTitle',
		type: 'boolean',
		value: false,
		description: 'stylesheetLoggedInUserClassDesc',
	},
};

module.beforeLoad = () => {
	if (module.options.subredditClass.value) {
		applySubredditClass();
	}
	if (module.options.usernameClass.value) {
		applyUsernameClass();
	}
	if (module.options.multiredditClass.value) {
		applyMultiredditClass();
	}

	$(CustomToggles.module).on('toggle', applyStyles);
	applyStyles();

	function applyStyles() {
		applyBodyClasses();
		loadStylesheets();
		applyCssSnippets();
	}
};

module.contentStart = () => {
	if (module.options.loggedInUserClass.value) {
		applyLoggedInUserClass();
	}
};

function applySubredditClass() {
	let name = currentSubreddit();
	if (name) {
		name = name.toLowerCase();
		BodyClasses.add(`res-r-${name}`);
	}
}

function applyMultiredditClass() {
	let name = currentMultireddit();
	if (name) {
		name = name.toLowerCase().replace(/\//g, '-');
		BodyClasses.add(`res-${name}`);
	}
}

function applyUsernameClass() {
	let name = currentUserProfile();
	if (name) {
		name = name.toLowerCase();
		BodyClasses.add(`res-user-${name}`);
	}
}

function applyLoggedInUserClass() {
	let name = loggedInUser();
	if (name) {
		name = name.toLowerCase();
		BodyClasses.add(`res-me-${name}`);
	}
}

function applyBodyClasses() {
	const addClasses = module.options.bodyClasses.value
		.filter(row => shouldApply(row[3], row[1], row[2]))
		.map(row => (row[0] || '').split(/[\s,]/))
		.reduce((a, b) => a.concat(b), []);

	const removeClasses = module.options.bodyClasses.value
		.filter(row => !shouldApply(row[3], row[1], row[2]))
		.map(row => (row[0] || '').split(/[\s,]/))
		.reduce((a, b) => a.concat(b), []);

	BodyClasses.add(...addClasses);
	BodyClasses.remove(...removeClasses);
}

const subredditNameRegexp = /^(?:\/?r\/)?([\w_]+)\/?$/;
const urlRegexp = /^(?:https?:\/\/[\w\.]+)?\/\w+/;

const sanitizeStylesheetUrls = filterMap(([url]) => {
	const subredditMatch = subredditNameRegexp.exec(url);
	if (subredditMatch) {
		return [`/r/${subredditMatch[1]}/stylesheet.css`];
	} else if (urlRegexp.test(url)) {
		return [url];
	}
});

function loadStylesheets() {
	const stylesheetUrls = sanitizeStylesheetUrls(
		module.options.loadStylesheets.value.filter(row => shouldApply(row[3], row[1], row[2])),
	);

	stylesheetManager.sync(stylesheetUrls);
}

const stylesheetManager = stylesheetElementManager(url => string.html`<link rel="stylesheet" href="${url}">`);

function applyCssSnippets() {
	const snippets = module.options.snippets.value
		.filter(row => shouldApply(row[3], row[1], row[2]))
		.map(([css]) => css);

	snippetManager.sync(snippets);
}

const snippetManager = stylesheetElementManager(css => {
	const style = document.createElement('style');
	style.textContent = css;
	return style;
});

function stylesheetElementManager<T>(generateElement: (x: T) => HTMLElement): { sync(xs: T[]): void } {
	const current = new Map();

	function sync(wantedKeys) {
		const currentKeys = Array.from(current.keys());

		difference(wantedKeys, currentKeys)
			.forEach(x => {
				const ele = generateElement(x);
				current.set(x, ele);
				(document.head || document.documentElement).append(ele);
			});

		difference(currentKeys, wantedKeys)
			.forEach(x => {
				const ele = current.get(x);
				current.delete(x);
				if (ele) ele.remove();
			});
	}

	return { sync };
}

function shouldApply(toggle, applyTo, applyList) {
	if (toggle && !CustomToggles.toggleActive(toggle)) return false;

	let subreddit = currentSubreddit();
	if (!subreddit) {
		return (applyTo !== 'include');
	}

	subreddit = subreddit.toLowerCase();
	applyList = typeof applyList === 'string' ? applyList.toLowerCase().split(',') : [];

	switch (applyTo) {
		case 'exclude':
			return !(applyList.includes(subreddit) || applyList.includes('all'));
		case 'include':
			return applyList.includes(subreddit) || applyList.includes('all');
		default:
			return true;
	}
}

function getToggles() {
	return [
		{ name: 'No toggle needed', value: '' },
		...CustomToggles.getToggles().map(({ key, text }) => ({ name: text, value: key })),
	];
}
