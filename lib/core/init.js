/* @flow */

import { RES_DISABLED_HASH, RES_SETTINGS_HASH, RES_SETTINGS_REDIRECT_TO_STANDALONE_HASH } from '../constants/urlHashes';
import { _loadI18n, getURL } from '../environment';
import {
	BodyClasses,
	waitFor,
	waitForChild,
	waitForEvent,
	initR2Watcher,
	initD2xWatcher,
	isAppType,
} from '../utils';
import { _loadModuleOptions } from './options/options';
import { _loadModulePrefs, _runModuleStage } from './modules/modules';
import { _addModuleBodyClasses } from './modules/bodyClasses';
import { migrate } from './migrate';

let start;

export function init() {
	if (location.hash === RES_DISABLED_HASH) return;

	if (document.documentElement && document.documentElement.classList.contains('res')) {
		// Firefox reloads the extension on all active pages when upgrading
		// RES doeesn't handle that well
		document.documentElement.setAttribute('res-warning', 'This page must be reloaded for Reddit Enhancement Suite to function correctly');
		throw new Error('RES has already been loaded on this page.');
	}

	// Testing requires access to the options page,
	// and I couldn't figure out a way to find the extension URL in Nightwatch
	if (location.hash.startsWith(RES_SETTINGS_REDIRECT_TO_STANDALONE_HASH)) {
		location.href = getURL(`options.html${location.hash.replace(RES_SETTINGS_REDIRECT_TO_STANDALONE_HASH, RES_SETTINGS_HASH)}`);
		return;
	}

	start();
}

// DOM / browser state

const sourceLoaded = new Promise(resolve => (start = resolve));

// Edge has weird bugs with MutationObservers
// so just make a best effort at divining when the head and body are ready

export const bodyStart: Promise<*> = sourceLoaded
	.then(() => Promise.race([
		waitForChild(document.documentElement, 'body'),
		waitFor(() => document.body, 100),
		contentLoaded,
	]));

export const bodyReady: Promise<*> = bodyStart
	.then(() => Promise.race([
		// `document.body === null` shouldn't be possible at this point,
		// but apparently it is for some Chrome users
		waitFor(() => document.body, 10).then(body => waitForChild(body, '.debuginfo')),
		contentLoaded, // in case reddit removes or changes .debuginfo
	]));

export const contentLoaded: Promise<*> = sourceLoaded
	.then(() => Promise.race([
		waitForEvent(window, 'DOMContentLoaded', 'load'),
		waitFor(() => document.readyState === 'interactive' || document.readyState === 'complete', 500),
	]));

export const loadComplete: Promise<*> = contentLoaded
	.then(() => Promise.race([
		waitForEvent(window, 'load'),
		waitFor(() => document.readyState === 'complete', 500),
	]));

// Module stages

export const loadI18n: Promise<void> = sourceLoaded
	.then(() => _loadI18n());

// TODO Migrations ought to be run before any other storage is loaded
export const runMigrations: Promise<void> = loadI18n
	.then(() => migrate());

export const loadDynamicOptions: Promise<void> = loadI18n
	.then(() => _runModuleStage('loadDynamicOptions', { skipEnabledCheck: true }));

export const loadOptions: Promise<*> = loadDynamicOptions
	.then(() => Promise.all([
		_loadModuleOptions(),
		_loadModulePrefs(),
	]));

export const addModuleBodyClasses: Promise<void> = loadOptions
	.then(() => _addModuleBodyClasses());

export const always: Promise<void> = loadOptions
	.then(() => _runModuleStage('always', { skipEnabledCheck: true }));

export const beforeLoad: Promise<void> = loadOptions
	.then(() => _runModuleStage('beforeLoad'));

export const watchers: Promise<*> = Promise.all([beforeLoad, bodyReady])
	.then(() => isAppType('d2x') ? initD2xWatcher() : initR2Watcher());

export const go: Promise<*> = Promise.all([beforeLoad, bodyReady])
	.then(() => _runModuleStage('go'));

export const afterLoad: Promise<void> = Promise.all([go, watchers, loadComplete])
	.then(() => _runModuleStage('afterLoad'));

// BodyClasses may have been added before document.body was ready
bodyStart.then(BodyClasses.addMissing);

// Preload custom fonts to avoid FOUT as the browser otherwise wouldn't start loading them before encountering them in `go`
if (process.env.BUILD_TARGET !== 'edge') { // Edge lacks these interfaces, and must loads fonts inlined in CSS; see webpack configuration
	// $FlowIssue
	const font = new FontFace('Batch', `url(${getURL('batch-icons-webfont.woff')})`, { style: 'normal', weight: 'normal' });
	// $FlowIssue
	const addFont = () => font.load().then(() => document.fonts.add(font));
	sourceLoaded.then(addFont);
	// In case first load fails, also try again a little later
	bodyStart.then(addFont).catch(console.error);
}
