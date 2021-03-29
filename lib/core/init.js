/* @flow */

import { once } from 'lodash-es';
import { _loadI18n } from '../environment';
import {
	BodyClasses,
	PagePhases,
	r2WatcherContentLoaded,
	r2WatcherContentStart,
	initD2xWatcher,
	isAppType,
} from '../utils';
import { _loadModuleOptions } from './options/options';
import { _loadModulePrefs, _runModuleStage } from './modules/modules';
import { _addModuleBodyClasses } from './modules/bodyClasses';

let _init;

export function init() {
	_init();
}

const start = new Promise(resolve => { _init = resolve; });

// Module stages

export const loadI18n: Promise<void> = start
	.then(() => _loadI18n());

export const onInit: Promise<void> = start
	.then(() => _runModuleStage('onInit', { skipEnabledCheck: true }));

export const loadOptions: Promise<*> = onInit
	.then(() => Promise.all([
		_loadModuleOptions(),
		_loadModulePrefs(),
	]));

export const addModuleBodyClasses: Promise<void> = loadOptions
	.then(() => _addModuleBodyClasses());

export const always: Promise<void> = Promise.all([loadI18n, loadOptions])

	.then(() => _runModuleStage('always', { skipEnabledCheck: true }));

export const beforeLoad: Promise<void> = Promise.all([loadI18n, loadOptions])
	.then(() => _runModuleStage('beforeLoad'));

export const contentStart: Promise<*> = Promise.all([beforeLoad, PagePhases.contentStart])
	.then(() => Promise.all([
		_runModuleStage('contentStart'),
		isAppType('r2') ? r2WatcherContentStart() : undefined,
	]));

export const go: Promise<*> = Promise.all([beforeLoad, PagePhases.contentStart])
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
Promise.all([onInit, PagePhases.bodyStart]).then(BodyClasses.addMissing);
