/* @flow */

import { _loadI18n } from '../environment';
import { _loadModuleOptions } from './options/options';
import { _loadModulePrefs, _runModuleStage } from './modules/modules';
import { migrate } from './migrate';

let start;
const started = new Promise(resolve => (start = resolve));

export function init() {
	start();
}

// Module stages

export const loadI18n: Promise<void> = started
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
