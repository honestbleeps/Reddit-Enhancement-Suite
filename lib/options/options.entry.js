/* @flow */

import { installRequestIdleCallback } from '../utils/requestIdleCallback';
import * as Context from '../environment/foreground/context';
import * as Core from '../core/init';
import { allowedModules } from '../core/modules';
import { ensureStorageAvailable } from './handleBlocking';
import * as SettingsConsole from './settingsConsole';

installRequestIdleCallback();

Promise.resolve()
	.then(() => {
		ensureStorageAvailable();
		return Context.retrieveFromParent(1500);
	})
	.then(async () => {
		allowedModules.push('nightMode', 'notifications');
		Core.init();
		await Promise.all([Core.loadI18n, Core.loadOptions]);
		SettingsConsole.start();
		window.parent.postMessage({ loadSuccess: true }, '*');
	})
	.catch(error => {
		console.error(error);
		window.parent.postMessage({ failedToLoad: true }, '*');
	});
