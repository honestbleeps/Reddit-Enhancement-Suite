import * as CustomToggles from './customToggles';
import { $ } from '../vendor';
import {
	BodyClasses,
	currentMultireddit,
	currentSubreddit,
	currentUserProfile,
	loggedInUser
} from '../utils';
import { Init } from '../core';

export const module = {};

module.moduleID = 'stylesheet';
module.moduleName = 'Stylesheet Loader';
module.description = 'Load extra stylesheets or your own CSS snippets.';
module.category = 'Appearance';
module.exclude = [
	'prefs',
	'account',
	'subredditAbout'
];

module.options = {};

module.options.redditThemes = {
	description: 'reddit allows you to customize the appearance of reddit! A reddit theme will be applied anywhere the default reddit style is present and subreddit style is disabled via reddit.',
	type: 'button',
	text: 'learn more',
	callback() {
		window.location.href = 'https://www.reddit.com/r/Enhancement/wiki/faq/srstyle#reddit_themes';
	}
};

export const updatesStylesheet = 'https://cdn.redditenhancementsuite.com/updates.css';

module.options.loadStylesheets = {
	type: 'table',
	value: [
		[updatesStylesheet, 'everywhere']
	],
	fields: [{
		name: 'url or subreddit',
		type: 'text'
	}, {
		name: 'applyTo',
		type: 'enum',
		values: [{
			name: 'Everywhere',
			value: 'everywhere'
		}, {
			name: 'Everywhere but:',
			value: 'exclude'
		}, {
			name: 'Only on:',
			value: 'include'
		}],
		value: 'everywhere',
		description: 'Apply filter to:'
	}, {
		name: 'applyToSubreddits',
		type: 'list',
		listType: 'subreddits'
	}, {
		name: 'toggleName',
		type: 'text'
	}]
};

module.options.snippets = {
	type: 'table',
	value: [],
	fields: [{
		name: 'snippet',
		type: 'textarea'
	}, {
		name: 'applyTo',
		type: 'enum',
		values: [{
			name: 'Everywhere',
			value: 'everywhere'
		}, {
			name: 'Everywhere but:',
			value: 'exclude'
		}, {
			name: 'Only on:',
			value: 'include'
		}],
		value: 'everywhere',
		description: 'Apply filter to:'
	}, {
		name: 'applyToSubreddits',
		type: 'list',
		listType: 'subreddits'
	}, {
		name: 'toggleName',
		type: 'text'
	}]
};

module.options.bodyClasses = {
	type: 'table',
	value: [],
	fields: [{
		name: 'classes',
		type: 'text'
	}, {
		name: 'applyTo',
		type: 'enum',
		values: [{
			name: 'Everywhere',
			value: 'everywhere'
		}, {
			name: 'Everywhere but:',
			value: 'exclude'
		}, {
			name: 'Only on:',
			value: 'include'
		}],
		value: 'everywhere',
		description: 'Apply filter to:'
	}, {
		name: 'applyToSubreddits',
		type: 'list',
		listType: 'subreddits'
	}, {
		name: 'toggleName',
		type: 'text'
	}]
};

module.options.subredditClass = {
	type: 'boolean',
	value: true,
	description: `
		When browsing a subreddit, add the subreddit name as a class to the body.
		<br><br>For example, /r/ExampleSubreddit adds <code>body.res-r-examplesubreddit</code>
	`
};
module.options.multiredditClass = {
	type: 'boolean',
	value: true,
	description: `
		When browsing a multireddit, add the multireddit name as a class to the body.
		<br><br>For example, /u/ExampleUser/m/ExampleMulti adds <code>body.res-user-exampleuser-m-examplemulti</code>
	`
};
module.options.usernameClass = {
	type: 'boolean',
	value: true,
	description: `
		When browsing a user profile, add the username as a class to the body.
		<br><br>For example, /u/ExampleUser adds <code>body.res-user-exampleuser</code>
	`
};
module.options.loggedInUserClass = {
	type: 'boolean',
	value: false,
	description: `
		When logged in, add your username as a class to the body.
		<br><br>For example, /u/ExampleUser adds <code>body.res-me-exampleuser</code>
	`
};

module.beforeLoad = function() {
	if (module.options.subredditClass.value) {
		applySubredditClass();
	}
	if (module.options.usernameClass.value) {
		applyUsernameClass();
	}
	if (module.options.multiredditClass.value) {
		applyMultiredditClass();
	}
	applyBodyClasses();
	Init.headReady.then(loadStylesheets);
	Init.headReady.then(applyCssSnippets);

	$(CustomToggles.module).on('activated deactivated', () => {
		applyBodyClasses();
		loadStylesheets();
		applyCssSnippets();
	});
};

module.go = function() {
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
		.map(row => (row[0] || '').split(/[\s,]/));

	const removeClasses = module.options.bodyClasses.value
		.filter(row => !shouldApply(row[3], row[1], row[2]))
		.map(row => (row[0] || '').split(/[\s,]/));

	BodyClasses.add(...addClasses);
	BodyClasses.remove(...removeClasses);
}

const subredditNameRegexp = /^(?:\/?r\/)?([\w_]+)\/?$/;
const urlRegexp = /^(?:https?:\/\/[\w\.]+)?\/\w+/;

function sanitizeStylesheetUrls() {
	return this
		.map(([url]) => {
			if (subredditNameRegexp.test(url)) {
				return `/r/${subredditNameRegexp.exec(url)[1]}/stylesheet.css`;
			} else if (urlRegexp.test(url)) {
				return url;
			}
		})
		.filter(x => x);
}

function loadStylesheets() {
	const remove = module.options.loadStylesheets.value
		.filter(row => !shouldApply(row[3], row[1], row[2]))
		::sanitizeStylesheetUrls();

	const add = module.options.loadStylesheets.value
		.filter(row => shouldApply(row[3], row[1], row[2]))
		::sanitizeStylesheetUrls()
		.filter(url => remove.indexOf(url) === -1);

	const addElements = add
		.filter(url => findStylesheetElement(url).length === 0)
		.map(url => createStylesheetElement(url))
		.reduce((collection, element) => collection.add(element), $());

	const removeElements = remove
		.map(url => findStylesheetElement(url))
		.reduce((collection, elements) => collection.add(elements), $());


	$(document.head).append(addElements);
	removeElements.remove();
}

function findStylesheetElement(url) {
	if (!url) return $();
	return $('link[rel=stylesheet]')
		.filter(function() {
			return url === this.getAttribute('href');
		});
}

function createStylesheetElement(url) {
	return $('<link rel="stylesheet">')
		.attr('href', url);
}

function applyCssSnippets() {
	function findSnippetElement(css) {
		if (!css) return $();
		return $('style.res-snippet').filter(function() {
			return $(this).text() === css;
		});
	}
	function createSnippetElement(css) {
		return $('<style class="res-snippet">').text(css);
	}

	const addElements = module.options.snippets.value
		.filter(row => shouldApply(row[3], row[1], row[2]) && findSnippetElement(row[0]).length === 0)
		.map(row => createSnippetElement(row[0]))
		.reduce((collection, element) => collection.add(element), $());

	const removeElements = module.options.snippets.value
		.filter(row => !shouldApply(row[3], row[1], row[2]))
		.map(row => findSnippetElement(row[0]))
		.reduce((collection, element) => collection.add(element), $());

	$(document.head).append(addElements);
	removeElements.remove();
}

function shouldApply(toggle, applyTo, applyList) {
	if (toggle && !CustomToggles.toggleActive(toggle)) return false;

	let subreddit = currentSubreddit();
	if (!subreddit) {
		return (applyTo !== 'include');
	}

	subreddit = subreddit.toLowerCase();
	applyList = typeof applyList === 'string' ? applyList.toLowerCase().split(',') : [];
	const all = (applyList && applyList.indexOf('all') !== -1);
	switch (applyTo) {
		case 'exclude':
			if ((applyList.indexOf(subreddit) !== -1) || all) {
				return false;
			}
			break;
		case 'include':
			if (!((applyList.indexOf(subreddit) !== -1) || all)) {
				return false;
			}
			break;
		default:
			break;
	}
	return true;
}
