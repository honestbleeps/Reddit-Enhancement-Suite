import * as RESMetadata from './metadata';
import {
	bodyClasses,
	gdAlert,
	nonNull,
	regexes,
	waitForChild,
	waitForEvent
} from '../utils';
import { migrate } from './migrate';

{
	const _resolve = {};

	RESUtils.init = () => {
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
			_resolve.runModules();
		}

		_resolve.sourceLoaded(); // kick everything off
	};

	RESUtils.init.await = {};

	// DOM / browser state

	RESUtils.init.await.sourceLoaded = new Promise(resolve => (_resolve.sourceLoaded = resolve));

	RESUtils.init.await.documentReady = RESUtils.init.await.sourceLoaded
		.then(() => nonNull(() => document && document.documentElement && document.documentElement.classList && (document.html = document.documentElement)));

	RESUtils.init.await.headReady = RESUtils.init.await.documentReady
		.then(() => waitForChild(document.documentElement, 'head'));

	RESUtils.init.await.bodyStart = RESUtils.init.await.documentReady
		.then(() => Promise.race([
			waitForChild(document.documentElement, 'body'),
			RESUtils.init.await.contentLoaded // the above MutationObserver doesn't always fire in Safari...
		]));

	RESUtils.init.await.bodyReady = RESUtils.init.await.bodyStart
		.then(() => Promise.race([
			waitForChild(document.body, '.debuginfo'),
			RESUtils.init.await.contentLoaded // in case reddit removes or changes .debuginfo
		]));

	RESUtils.init.await.contentLoaded = typeof window !== 'undefined' ?
		waitForEvent(window, 'load') :
		Promise.reject('Environment has no window.');

	// Core setup

	RESUtils.init.await.migrate = RESUtils.init.await.sourceLoaded
		.then(() => migrate());

	RESUtils.init.await.library = libraryID =>
		RESUtils.init.await.sourceLoaded
			.then(() => libraries[libraryID]);

	// Module stages
	{
		RESUtils.init.await.runModules = new Promise(resolve => (_resolve.runModules = resolve));

		RESUtils.init.await.loadLibraries = RESUtils.init.await.runModules
			.then(() => allModules('loadLibraries'));

		RESUtils.init.await.loadDynamicOptions = RESUtils.init.await.loadLibraries
			.then(() => allModules('loadDynamicOptions'));

		RESUtils.init.await.options = RESUtils.init.await.loadDynamicOptions
			.then(() => Promise.all([
				allModules(id => RESUtils.options.getOptions(id)),
				allModules(id => RESUtils.options.getModulePrefs(id))
			]));

		RESUtils.init.await.addOptionsBodyClasses = RESUtils.init.await.options
			.then(() => allModules('addOptionsBodyClasses'));

		RESUtils.init.await.beforeLoad = Promise.all([
			RESUtils.init.await.options,
			RESUtils.init.await.headReady
		]).then(() => allModules('beforeLoad'));

		RESUtils.init.await.go = Promise.all([
			RESUtils.init.await.beforeLoad,
			RESUtils.init.await.bodyReady
		]).then(() => allModules('go'));

		RESUtils.init.await.afterLoad = Promise.all([
			RESUtils.init.await.go,
			RESUtils.init.await.contentLoaded
		]).then(() => allModules('afterLoad'));

		const errored = new Set();

		function allModules(keyOrFn) {
			let stageName = 'ad-hoc stage';
			if (typeof keyOrFn === 'string') {
				const key = stageName = keyOrFn;
				keyOrFn = (id, mod) => mod[key]();
			}
			return Promise.all(
				Object.keys(modules)
					.filter(id => !errored.has(id))
					.map(async id => {
						try {
							await keyOrFn(id, modules[id], modules);
						} catch (e) {
							console.error('Error in module:', id, 'during:', stageName);
							console.error(e);
							errored.add(id);
						}
					})
			);
		}
	}

	RESUtils.init.await.metadata.then(() => bodyClasses.add());
	RESUtils.init.await.documentReady.then(() => bodyClasses.add());
	RESUtils.init.await.bodyStart.then(() => bodyClasses.add());

	Promise.all([
		RESUtils.init.await.bodyReady,
		RESUtils.init.await.go
	]).then(RESUtils.initObservers);

	Promise.all([
		RESUtils.init.await.metadata,
		RESUtils.init.await.bodyReady
	]).then(reportVersion);

	RESUtils.init.await.bodyReady.then(homePage);

	function reportVersion() {
		// report the version of RES to reddit's advisory checker.
		const RESVersionReport = RESUtils.createElement('div', 'RESConsoleVersion');
		RESVersionReport.setAttribute('style', 'display: none;');
		RESVersionReport.textContent = RESMetadata.version;
		document.body.appendChild(RESVersionReport);
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

		Object.keys(RESUtils.init.await)
			.filter(p => RESUtils.init.await[p] instanceof Promise)
			.forEach(p => RESUtils.init.await[p].then(() => (end[p] = performance.now())));

		function diff(a, b) {
			const time = (end[b] - end[a]) | 0;
			return `<span style="color: ${time < 0 ? 'green' : 'red'}">${time}</span>ms`;
		}

		RESUtils.init.await.afterLoad.then(() => gdAlert.open([
			`beforeLoad stalled for ${diff('headReady', 'options')}`,
			`go stalled for ${diff('bodyReady', 'beforeLoad')}`,
			`afterLoad stalled for ${diff('contentLoaded', 'go')}`,
			`bodyReady was late by ${diff('contentLoaded', 'bodyReady')}`,
			`addOptionsBodyClasses was late by ${diff('bodyStart', 'options')}`
		].reduce((acc, line) => `${acc}<div>${line}</div>`, '')));
	}

	RESUtils.init();
}
