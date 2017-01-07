/* @flow */

import _ from 'lodash';
import { filter, flow } from 'lodash/fp';
import { $ } from '../vendor';
import { Module } from '../core/module';
import {
	BodyClasses,
	currentMultireddit,
	currentSubreddit,
	currentUserProfile,
	filterMap,
	loggedInUser,
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
		description: 'reddit allows you to customize the appearance of reddit! A reddit theme will be applied anywhere the default reddit style is present and subreddit style is disabled via reddit.',
		type: 'button',
		text: 'learn more',
		callback() {
			window.location.href = 'https://www.reddit.com/r/Enhancement/wiki/faq/srstyle#reddit_themes';
		},
	},
	loadStylesheets: {
		type: 'table',
		description: 'External or subreddit CSS to load.',
		value: [
			// keep in sync with core/migrate.js
			['https://cdn.redditenhancementsuite.com/updates.css', 'everywhere'],
		],
		fields: [{
			key: 'urlOrSubreddit',
			name: 'url or subreddit',
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
			key: 'applyToSubreddits',
			name: 'applyToSubreddits',
			type: 'list',
			listType: 'subreddits',
		}, {
			key: 'toggleName',
			name: 'toggleName',
			type: 'text',
		}],
	},
	snippets: {
		type: 'table',
		description: 'CSS snippets to load.',
		value: ([]: Array<[string, string, string, string]>),
		fields: [{
			key: 'snippet',
			name: 'snippet',
			type: 'textarea',
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
			key: 'applyToSubreddits',
			name: 'applyToSubreddits',
			type: 'list',
			listType: 'subreddits',
		}, {
			key: 'toggleName',
			name: 'toggleName',
			type: 'text',
		}],
	},
	bodyClasses: {
		type: 'table',
		description: 'CSS classes to add to &lt;body&gt;.',
		value: ([]: Array<[string, string, string, string]>),
		fields: [{
			key: 'classes',
			name: 'classes',
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
			key: 'applyToSubreddits',
			name: 'applyToSubreddits',
			type: 'list',
			listType: 'subreddits',
		}, {
			key: 'toggleName',
			name: 'toggleName',
			type: 'text',
		}],
	},
	subredditClass: {
		type: 'boolean',
		value: true,
		description: `
			When browsing a subreddit, add the subreddit name as a class to the body.
			<br><br>For example, /r/ExampleSubreddit adds <code>body.res-r-examplesubreddit</code>
		`,
	},
	multiredditClass: {
		type: 'boolean',
		value: true,
		description: `
			When browsing a multireddit, add the multireddit name as a class to the body.
			<br><br>For example, /u/ExampleUser/m/ExampleMulti adds <code>body.res-user-exampleuser-m-examplemulti</code>
		`,
	},
	usernameClass: {
		type: 'boolean',
		value: true,
		description: `
			When browsing a user profile, add the username as a class to the body.
			<br><br>For example, /u/ExampleUser adds <code>body.res-user-exampleuser</code>
		`,
	},
	loggedInUserClass: {
		type: 'boolean',
		value: false,
		description: `
			When logged in, add your username as a class to the body.
			<br><br>For example, /u/ExampleUser adds <code>body.res-me-exampleuser</code>
		`,
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

	$(CustomToggles.module).on('activated deactivated', applyStyles);
	applyStyles();

	function applyStyles() {
		applyBodyClasses();
		loadStylesheets();
		applyCssSnippets();
	}
};

module.go = () => {
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
	if (subredditNameRegexp.test(url)) {
		return [`/r/${subredditNameRegexp.exec(url)[1]}/stylesheet.css`];
	} else if (urlRegexp.test(url)) {
		return [url];
	}
});

function loadStylesheets() {
	const stylesheetUrls = flow(
		filter(row => shouldApply(row[3], row[1], row[2])),
		sanitizeStylesheetUrls
	)(module.options.loadStylesheets.value);

	stylesheetManager.sync(stylesheetUrls);
}

const stylesheetManager = stylesheetElementManager(url => $('<link rel="stylesheet">').attr('href', url));

function applyCssSnippets() {
	const snippets = module.options.snippets.value
		.filter(row => shouldApply(row[3], row[1], row[2]))
		.map(([css]) => css);

	snippetManager.sync(snippets);
}

const snippetManager = stylesheetElementManager(css => $('<style>', { text: css }));

function stylesheetElementManager<T>(generateElement: (x: T) => JQuery): { sync(xs: T[]): void } {
	const current = new Map();

	function sync(wantedKeys) {
		const currentKeys = Array.from(current.keys());

		const addElements = _.difference(wantedKeys, currentKeys)
			.map(x => {
				const $ele = generateElement(x);
				current.set(x, $ele);
				return $ele;
			})
			.reduce((a, b) => a.add(b), $());

		const removeElements = _.difference(currentKeys, wantedKeys)
			.map(x => {
				const $ele = current.get(x) || $();
				current.delete(x);
				return $ele;
			})
			.reduce((a, b) => a.add(b), $());

		addElements.appendTo(document.head);
		removeElements.remove();
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
