/* @flow */

import { RES_DISABLED_KEY } from '../constants/sessionStorage';
import { _loadI18n } from '../environment/i18n';
import * as Modules from './modules';
import { _loadModuleOptions } from './options/options';
import { _loadModulePrefs } from './modules/modules';
import { migrate } from './migrate';
import { moduleStageEnd, moduleStageStart, startProfiling } from './profiling';
import type { BooleanOption, EnumOption, ModuleOption } from './module'; // eslint-disable-line no-unused-vars
import { // eslint-disable-line import/order
	BodyClasses,
	initObservers,
	waitFor,
	waitForChild,
	waitForEvent,
	newSitetable,
} from '../utils';

let start;

export function init() {
	if (
		!location.hostname.endsWith('.reddit.com') ||
		(/^(?:i|m|static|thumbs|blog|code|mod|about|ads)\.reddit\.com$/i).test(location.hostname) ||
		(/^\/advertising/).test(location.pathname) ||
		(/\.(?:compact|mobile|json|json-html)$/i).test(location.pathname)
	) {
		return;
	}

	if (sessionStorage.getItem(RES_DISABLED_KEY)) return;

	startProfiling();

	start();
}

// DOM / browser state

const sourceLoaded = new Promise(resolve => (start = resolve));

export const documentReady = sourceLoaded
	.then(() => waitFor(() => document && document.documentElement));

// Edge sometimes has weird bugs with MutationObservers
// so just make a best effort at divining when the head and body are ready

export const headReady = documentReady
	.then(() => Promise.race([
		waitForChild(document.documentElement, 'head'),
		(waitFor(() => document.head, 100): Promise<any>),
		contentLoaded,
	]));

export const bodyStart = documentReady
	.then(() => Promise.race([
		waitForChild(document.documentElement, 'body'),
		(waitFor(() => document.body, 100): Promise<any>),
		contentLoaded,
	]));

export const bodyReady = bodyStart
	.then(() => Promise.race([
		waitFor(() => document.body, 10).then(body => waitForChild(body, '.debuginfo')),
		contentLoaded, // in case reddit removes or changes .debuginfo
	]));

export const contentLoaded = documentReady
	.then(() => Promise.race([
		waitForEvent(window, 'DOMContentLoaded', 'load'),
		waitFor(() => document.readyState === 'interactive' || document.readyState === 'complete', 500),
	]));

export const loadComplete = contentLoaded
	.then(() => Promise.race([
		waitForEvent(window, 'load'),
		waitFor(() => document.readyState === 'complete', 500),
	]));

// Module stages

export const loadI18n = sourceLoaded
	.then(() => _loadI18n());

export const runMigrations = loadI18n
	.then(() => migrate());

export const loadDynamicOptions = loadI18n
	.then(() => allModules('loadDynamicOptions', { skipEnabledCheck: true }));

export const loadOptions = loadDynamicOptions
	.then(() => (Promise.all([
		_loadModuleOptions(),
		_loadModulePrefs(),
	]): Promise<any>));

export const addModuleBodyClasses = loadOptions
	.then(() => _addModuleBodyClasses());

export const always = Promise.all([loadOptions, headReady])
	.then(() => allModules('always', { skipEnabledCheck: true }));

export const beforeLoad = Promise.all([loadOptions, headReady])
	.then(() => allModules('beforeLoad'));

export const go = Promise.all([beforeLoad, bodyReady])
	.then(() => {
		initObservers();
		return Promise.all([newSitetable(document.body), allModules('go')]);
	});

export const afterLoad = Promise.all([go, loadComplete])
	.then(() => allModules('afterLoad'));

const ERRORED_KEY = Symbol('errored');

async function allModules(key, { skipEnabledCheck = false }: {| skipEnabledCheck?: boolean |} = {}) {
	await Promise.all(
		Modules.all()
			.filter(module => (
				module[key] &&
				!module[ERRORED_KEY] &&
				(skipEnabledCheck || Modules.isRunning(module))
			))
			.map(async module => {
				moduleStageStart(key, module.moduleID);
				try {
					const stage = module[key];
					await stage();
				} catch (e) {
					module[ERRORED_KEY] = true;
					console.error('Error in module:', module.moduleID, 'during:', key);
					console.error(e);
				}
				moduleStageEnd(key, module.moduleID);
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

		for (const [optId, opt] of Object.entries(module.options)) {
			if (!(opt.bodyClass && opt.value)) continue;

			/*:: (opt: BooleanOption<any> | EnumOption<any>); */

			if (opt.dependsOn && !opt.dependsOn(module.options)) continue;

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

documentReady.then(() => BodyClasses.add());
bodyStart.then(() => BodyClasses.add());
