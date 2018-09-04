/* @flow */

import { RES_DISABLED_KEY } from '../constants/sessionStorage';
import { _loadI18n, getURL } from '../environment';
import {
	BodyClasses,
	initObservers,
	waitFor,
	waitForChild,
	waitForEvent,
	newSitetable,
} from '../utils';
import { _loadModuleOptions } from './options/options';
import { _loadModulePrefs, _runModuleStage } from './modules/modules';
import { _addModuleBodyClasses } from './modules/bodyClasses';
import { migrate } from './migrate';

let start;

export function init() {
	if (sessionStorage.getItem(RES_DISABLED_KEY)) return;

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

export const go: Promise<*> = Promise.all([beforeLoad, bodyReady])
	.then(() => {
		initObservers();
		return Promise.all([newSitetable(document.body), _runModuleStage('go')]);
	});

export const afterLoad: Promise<void> = Promise.all([go, loadComplete])
	.then(() => _runModuleStage('afterLoad'));

bodyStart.then(() => BodyClasses.add());

// Preload custom fonts to avoid FOUT as the browser otherwise wouldn't start loading them before encountering them in `go`
if (process.env.BUILD_TARGET !== 'edge') { // Edge lacks these interfaces, and must loads fonts inlined in CSS; see webpack configuration
	// $FlowIssue
	const font = new FontFace('Batch', `url(${getURL('batch-icons-webfont.woff')})`, { style: 'normal', weight: 'normal' });
	font.load().then(() => {
		// $FlowIssue
		document.fonts.add(font);
	});
}
