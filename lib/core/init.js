import { $ } from '../vendor';
import * as Metadata from './metadata';
import * as Modules from './modules';
import { _loadModuleOptions } from './options/options';
import { _loadModulePrefs } from './modules/modules';
import { migrate } from './migrate';
import { // eslint-disable-line import/order
	Alert,
	BodyClasses,
	filter,
	initObservers,
	isReddit,
	map,
	nonNull,
	now,
	range,
	waitForChild,
	waitForEvent,
} from '../utils';

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

	if (isReddit()) {
		_resolve.sourceLoaded(); // kick everything off
	}
}

// DOM / browser state

const sourceLoaded = new Promise(resolve => (_resolve.sourceLoaded = resolve));

export const documentReady = sourceLoaded
	.then(() => nonNull(() => document && document.documentElement && document.documentElement.classList && (document.html = document.documentElement)));

// Multiple browsers (Safari, Edge) seem to have weird bugs with MutationObservers
// so just make a best effort at divining when the head and body are ready

export const headReady = documentReady
	.then(() => Promise.race([
		waitForChild(document.documentElement, 'head'),
		nonNull(() => document.head, 100),
		contentLoaded,
	]));

export const bodyStart = documentReady
	.then(() => Promise.race([
		waitForChild(document.documentElement, 'body'),
		nonNull(() => document.body, 100),
		contentLoaded,
	]));

export const bodyReady = bodyStart
	.then(() => Promise.race([
		waitForChild(document.body, '.debuginfo'),
		contentLoaded, // in case reddit removes or changes .debuginfo
	]));

export const contentLoaded = typeof window !== 'undefined' ?
	waitForEvent(window, 'load') :
	Promise.reject('Environment has no window.');

// Module stages

sourceLoaded.then(() => migrate());

export const loadDynamicOptions = sourceLoaded
	.then(() => allModules('loadDynamicOptions'));

export const loadOptions = loadDynamicOptions
	.then(() => Promise.all([
		_loadModuleOptions(),
		_loadModulePrefs(),
	]));

export const addModuleBodyClasses = loadOptions
	.then(() => _addModuleBodyClasses());

export const always = Promise.all([loadOptions, headReady])
	.then(() => allModules('always'));

export const beforeLoad = Promise.all([loadOptions, headReady])
	.then(() => allModules('beforeLoad', true));

export const go = Promise.all([beforeLoad, bodyReady])
	.then(() => allModules('go', true));

export const afterLoad = Promise.all([go, contentLoaded])
	.then(() => allModules('afterLoad', true));

const errored = new Set();

function allModules(key, checkShouldRun = false) {
	return Promise.all(
		Modules.all()
			::filter(({ moduleID: id }) => !errored.has(id))
			::map(async module => {
				try {
					if (!module[key]) return;
					if (checkShouldRun && !Modules.isRunning(module)) return;
					await module[key]();
				} catch (e) {
					const id = module.moduleID;
					console.error('Error in module:', id, 'during:', key);
					console.error(e);
					errored.add(id);
				}
			})
	);
}

// Adds body classes for modules or enabled options that have `bodyClass: true`
// In the form `res-moduleId-optionKey` for boolean options
// and `res-moduleId-optionKey-optionValue` for enum options
// spaces in enum option values will be replaced with underscores
function _addModuleBodyClasses() {
	for (const module of Modules.all()) {
		if (!Modules.isRunning(module)) continue;

		if (module.bodyClass) BodyClasses.add(`res-${module.moduleID}`);

		for (const [optId, opt] of Object.entries(module.options || {})) {
			if (!(opt.bodyClass && opt.value)) continue;

			if (opt.type !== 'enum' && opt.type !== 'boolean') {
				if (process.env.NODE_ENV === 'development') {
					throw new Error(`modules['${module.moduleID}'].options['${optId}'] - only enum and boolean options may generate body classes`);
				} else {
					console.error(`modules['${module.moduleID}'].options['${optId}'] - only enum and boolean options may generate body classes`);
					continue;
				}
			}

			let cls = typeof opt.bodyClass === 'string' ?
				opt.bodyClass :
				`res-${module.moduleID}-${optId}`;

			if (opt.type === 'enum') {
				cls += `-${opt.value.replace(/\s/g, '_')}`;
			}

			BodyClasses.add(cls);
		}
	}
}

BodyClasses.add('res', 'res-v430');
const versionComponents = Metadata.version.split('.');
for (const i of range(0, versionComponents.length)) {
	BodyClasses.add(`res-v${versionComponents.slice(0, i + 1).join('-')}`);
}

documentReady.then(() => BodyClasses.add());
bodyStart.then(() => BodyClasses.add());

Promise.all([bodyReady, go]).then(initObservers);

bodyReady.then(reportVersion);

bodyReady.then(homePage);

function reportVersion() {
	// report the version of RES to reddit's advisory checker.
	$('<div>', {
		id: 'RESConsoleVersion',
		style: 'display: none;',
		text: Metadata.version,
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
		go,
	};

	for (const [key, promise] of Object.entries(promises)) {
		promise.then(() => (end[key] = now()));
	}

	function diff(a, b) {
		const time = (end[b] - end[a]) | 0;
		return `<span style="color: ${time < 0 ? 'green' : 'red'}">${time}</span>ms`;
	}

	afterLoad.then(() => Alert.open([
		`beforeLoad stalled for ${diff('headReady', 'loadOptions')}`,
		`go stalled for ${diff('bodyReady', 'beforeLoad')}`,
		`afterLoad stalled for ${diff('contentLoaded', 'go')}`,
		`addModuleBodyClasses was late by ${diff('bodyStart', 'loadOptions')}`,
	].reduce((acc, line) => `${acc}<div>${line}</div>`, '')));
}
