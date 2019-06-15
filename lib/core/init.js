/* @flow */

import { once } from 'lodash/fp';
import { _loadI18n, getURL } from '../environment';
import {
	BodyClasses,
	waitFor,
	waitForChild,
	waitForDescendant,
	waitForEvent,
	r2WatcherContentLoaded,
	r2WatcherSitetableStart,
	initD2xWatcher,
	isAppType,
	isPageType,
} from '../utils';
import { _loadModuleOptions } from './options/options';
import { _loadModulePrefs, _runModuleStage } from './modules/modules';
import { _addModuleBodyClasses } from './modules/bodyClasses';
import { migrate } from './migrate';

let start;

export function init() {
	start();
}

// DOM / browser state

const sourceLoaded = new Promise(resolve => (start = resolve));

export const bodyStart: Promise<*> = sourceLoaded
	.then(() => waitForChild(document.documentElement, 'body'))
	// `document.body === null` at this point has been reported for users of Firefox and Chrome,
	// so wait till the reference has been updated before progressing
	.then(() => waitFor(() => document.body, 10));

export const sitetableStarted: Promise<*> = bodyStart
	.then(() => Promise.race([
		waitForDescendant(document.body, isPageType('comments') ? '.sitetable.nestedlisting' : '#siteTable'),
		contentLoaded,
	]));

export const contentLoaded: Promise<*> = bodyStart
	.then(() => Promise.race([
		waitForEvent(window, 'DOMContentLoaded', 'load'),
		waitFor(() => document.readyState === 'interactive' || document.readyState === 'complete', 500),
	]));

export const loadComplete: Promise<*> = bodyStart
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

export const onInit: Promise<void> = loadI18n
	.then(() => _runModuleStage('onInit', { skipEnabledCheck: true }));

export const loadOptions: Promise<*> = onInit
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

export const contentStart: Promise<*> = Promise.all([beforeLoad, sitetableStarted])
	.then(() => Promise.all([
		_runModuleStage('contentStart'),
		isAppType('r2') ? r2WatcherSitetableStart() : undefined,
	]));

export const go: Promise<*> = Promise.all([beforeLoad, sitetableStarted])
	.then(() => {
		const run = once(() => Promise.all([
			isAppType('d2x') ? initD2xWatcher() : r2WatcherContentLoaded(),
			_runModuleStage('go'),
		]));
		// Prevent additional forced reflow in Reddit's scripts by running first thing on the `DOMContentLoaded` event
		window.addEventListener('DOMContentLoaded', run, true);
		return contentLoaded.then(run);
	});

export const afterLoad: Promise<void> = Promise.all([go, loadComplete])
	.then(() => _runModuleStage('afterLoad'));

// BodyClasses may have been added before document.body was ready
bodyStart.then(BodyClasses.addMissing);

// Preload custom fonts to avoid FOUT as the browser otherwise wouldn't start loading them before encountering them in `go`
sourceLoaded.then(() => {
	// $FlowIssue
	const font = new FontFace('Batch', `url(${getURL('batch-icons-webfont.woff')})`, { style: 'normal', weight: 'normal' });
	// $FlowIssue
	font.load().then(() => document.fonts.add(font));
});
