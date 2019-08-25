/* @flow */

import { once } from 'lodash/fp';
import { _loadI18n, getURL } from '../environment';
import * as Context from '../environment/foreground/context';
import {
	BodyClasses,
	PagePhases,
	r2WatcherContentLoaded,
	r2WatcherSitetableStart,
	initD2xWatcher,
	isAppType,
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

export const contentStart: Promise<*> = Promise.all([beforeLoad, PagePhases.sitetableStarted])
	.then(() => Promise.all([
		_runModuleStage('contentStart'),
		isAppType('r2') ? r2WatcherSitetableStart() : undefined,
	]));

export const go: Promise<*> = Promise.all([beforeLoad, PagePhases.sitetableStarted])
	.then(() => {
		const run = once(() => Promise.all([
			isAppType('d2x') ? initD2xWatcher() : r2WatcherContentLoaded(),
			_runModuleStage('go'),
		]));
		// Prevent additional forced reflow in Reddit's scripts by running first thing on the `DOMContentLoaded` event
		window.addEventListener('DOMContentLoaded', run, true);
		return PagePhases.contentLoaded.then(run);
	});

export const afterLoad: Promise<void> = Promise.all([go, PagePhases.loadComplete])
	.then(() => _runModuleStage('afterLoad'));

// BodyClasses may have been added before document.body was ready
Promise.all([sourceLoaded, PagePhases.bodyStart]).then(BodyClasses.addMissing);

Promise.all([sourceLoaded, PagePhases.bodyStart]).then(() => { Context.establish(contentStart); });

// Preload custom fonts to avoid FOUT as the browser otherwise wouldn't start loading them before encountering them in `go`
sourceLoaded.then(() => {
	// $FlowIssue
	const font = new FontFace('Batch', `url(${getURL('batch-icons-webfont.woff')})`, { style: 'normal', weight: 'normal' });
	// $FlowIssue
	font.load().then(() => document.fonts.add(font));
});
