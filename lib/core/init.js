/* @flow */

import { RES_DISABLED_KEY } from '../constants/sessionStorage';
import { _loadI18n } from '../environment';
import {
	BodyClasses,
	initObservers,
	waitFor,
	waitForChild,
	waitForEvent,
	newSitetable,
	markStart,
	markEnd,
	markCheckpoint,
} from '../utils';
import { _logPerfSummary } from '../utils/profiling';
import { _loadModuleOptions } from './options/options';
import { _loadModulePrefs, _runModuleStage } from './modules/modules';
import { _addModuleBodyClasses } from './modules/bodyClasses';
import { migrate } from './migrate';

export async function init() {
	if (sessionStorage.getItem(RES_DISABLED_KEY)) return;

	// DOMContentLoaded; used as a fallback for init stages
	const contentLoaded = Promise.race([
		waitForEvent(window, 'DOMContentLoaded', 'load'),
		waitFor(() => document.readyState === 'interactive' || document.readyState === 'complete', 500),
	]);

	// --- initialization start ---

	const tag = markStart();

	await _loadI18n();
	markCheckpoint(tag, 'i18n');

	await Promise.all([
		migrate(),
		_loadModuleOptions(),
		_loadModulePrefs(),
	]);
	markCheckpoint(tag, 'storage');

	_addModuleBodyClasses();
	markCheckpoint(tag, 'classes');

	await _runModuleStage('always', { skipEnabledCheck: true });
	markCheckpoint(tag, 'always');

	await _runModuleStage('beforeLoad');
	markCheckpoint(tag, 'beforeLoad');

	// --- <body> start ---

	// Edge has weird bugs with MutationObservers
	// so just make a best effort at divining when the head and body are ready
	await Promise.race([
		waitForChild(document.documentElement, 'body'),
		waitFor(() => document.body, 100),
		contentLoaded,
	]);
	markCheckpoint(tag, 'body');

	// add pending classes to <body>
	BodyClasses.add();
	markCheckpoint(tag, 'flush');

	// --- <body> complete ---

	await Promise.race([
		// `document.body === null` shouldn't be possible at this point,
		// but apparently it is for some Chrome users
		waitFor(() => document.body, 10).then(body => waitForChild(body, '.debuginfo')),
		contentLoaded, // in case reddit removes or changes .debuginfo
	]);
	markCheckpoint(tag, 'content');

	initObservers();
	markCheckpoint(tag, 'observers');

	await Promise.all([
		newSitetable(document.body),
		_runModuleStage('go'),
	]);
	markCheckpoint(tag, 'go/sitetable');

	// --- load complete ---

	await Promise.race([
		waitForEvent(window, 'load'),
		waitFor(() => document.readyState === 'complete', 500),
	]);
	markCheckpoint(tag, 'load');

	await _runModuleStage('afterLoad');
	markEnd(tag, 'afterLoad');

	_logPerfSummary();
}
