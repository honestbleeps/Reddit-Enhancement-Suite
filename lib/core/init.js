import { $ } from '../vendor';
import {
	_loadModuleOptions,
	_loadModulePrefs
} from './modules';
import {
	bodyClasses,
	gdAlert,
	initObservers,
	nonNull,
	now,
	regexes,
	waitForChild,
	waitForEvent
} from '../utils';
import {
	metadata,
	migrate
} from './';

const _resolve = {};

export function init() {
	// Don't fire the script on the iframe. This annoyingly fires this whole thing twice. Yuck.
	// Also don't fire it on static.reddit or thumbs.reddit, as those are just images.
	// Also omit blog and code.reddit
	if (
		(/\/toolbar\/toolbar\?id/i.test(location.href)) ||
		(/comscore-iframe/i.test(location.href)) ||
		(/(?:static|thumbs|blog|code)\.reddit\.com/i.test(location.hostname)) ||
		(/^[www\.]?(?:i|m)\.reddit\.com/i.test(location.href)) ||
		(/\.(?:compact|mobile|json|json-html)$/i.test(location.pathname)) ||
		(/metareddit\.com/i.test(location.href))) {
		return;
	}
	if (sessionStorage.getItem('RES.disabled')) return;

	if (sessionStorage.getItem('RES.profiling')) setupProfiling();

	if (regexes.all.test(location.href)) {
		_resolve.sourceLoaded(); // kick everything off
	}
}

// DOM / browser state

const sourceLoaded = new Promise(resolve => (_resolve.sourceLoaded = resolve));

export const documentReady = sourceLoaded
	.then(() => nonNull(() => document && document.documentElement && document.documentElement.classList && (document.html = document.documentElement)));

export const headReady = documentReady
	.then(() => waitForChild(document.documentElement, 'head'));

export const bodyStart = documentReady
	.then(() => Promise.race([
		waitForChild(document.documentElement, 'body'),
		contentLoaded // the above MutationObserver doesn't always fire in Safari...
	]));

export const bodyReady = bodyStart
	.then(() => Promise.race([
		waitForChild(document.body, '.debuginfo'),
		contentLoaded // in case reddit removes or changes .debuginfo
	]));

export const contentLoaded = typeof window !== 'undefined' ?
	waitForEvent(window, 'load') :
	Promise.reject('Environment has no window.');

// Module stages

export const runMigration = sourceLoaded
	.then(() => migrate());

export const loadDynamicOptions = runMigration
	.then(() => allModules('loadDynamicOptions'));

export const loadOptions = loadDynamicOptions
	.then(() => Promise.all([
		_loadModuleOptions(),
		_loadModulePrefs()
	]));

export const addOptionsBodyClasses = loadOptions
	.then(() => allModules('addOptionsBodyClasses'));

export const beforeLoad = Promise.all([loadOptions, headReady])
	.then(() => allModules('beforeLoad'));

export const go = Promise.all([beforeLoad, bodyReady])
	.then(() => allModules('go'));

export const afterLoad = Promise.all([go, contentLoaded])
	.then(() => allModules('afterLoad'));

const errored = new Set();

function allModules(key) {
	return Promise.all(
		Object.keys(modules)
			.filter(id => !errored.has(id))
			.map(async id => {
				try {
					await modules[id][key]();
				} catch (e) {
					console.error('Error in module:', id, 'during:', key);
					console.error(e);
					errored.add(id);
				}
			})
	);
}

documentReady.then(() => bodyClasses.add());
bodyStart.then(() => bodyClasses.add());

Promise.all([bodyReady, go]).then(initObservers);

bodyReady.then(reportVersion);

bodyReady.then(homePage);

if (process.env.NODE_ENV === 'development') {
	const start = now();

	const unresolved = {
		documentReady,
		headReady,
		bodyStart,
		bodyReady,
		contentLoaded,
		runMigration,
		loadDynamicOptions,
		loadOptions,
		addOptionsBodyClasses,
		beforeLoad,
		go,
		afterLoad
	};

	for (const [key, promise] of Object.entries(unresolved)) {
		promise.then(() => {
			delete unresolved[key];
			console.info(`@${(now() - start).toFixed(2)}`, key, 'remaining:', ...Object.keys(unresolved));
		});
	}
}

function reportVersion() {
	// report the version of RES to reddit's advisory checker.
	$('<div>', {
		id: 'RESConsoleVersion',
		style: 'display: none;',
		text: metadata.version
	}).appendTo(document.body);
}

function homePage() {
	if (location.href.includes('reddit.honestbleeps.com/download') || location.href.includes('redditenhancementsuite.com/download')) {
		Array.from(document.body.querySelectorAll('.install')).forEach(link => {
			link.classList.add('update');
			link.classList.add('res4'); // if update but not RES 4, then FF users == greasemonkey...
			link.classList.remove('install');
		});
	}
}

function setupProfiling() {
	const end = {};

	const promises = {
		headReady,
		bodyStart,
		bodyReady,
		contentLoaded,
		loadOptions,
		beforeLoad,
		go
	};

	for (const [key, promise] of Object.entries(promises)) {
		promise.then(() => (end[key] = now()));
	}

	function diff(a, b) {
		const time = (end[b] - end[a]) | 0;
		return `<span style="color: ${time < 0 ? 'green' : 'red'}">${time}</span>ms`;
	}

	afterLoad.then(() => gdAlert.open([
		`beforeLoad stalled for ${diff('headReady', 'loadOptions')}`,
		`go stalled for ${diff('bodyReady', 'beforeLoad')}`,
		`afterLoad stalled for ${diff('contentLoaded', 'go')}`,
		`bodyReady was late by ${diff('contentLoaded', 'bodyReady')}`,
		`addOptionsBodyClasses was late by ${diff('bodyStart', 'loadOptions')}`
	].reduce((acc, line) => `${acc}<div>${line}</div>`, '')));
}
