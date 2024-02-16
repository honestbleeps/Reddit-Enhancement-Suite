/* @flow */

import './handleBlocking';
import * as Context from '../environment/foreground/context';
import * as Core from '../core/init';
import { allowedModules } from '../core/modules';
import * as SettingsConsole from './settingsConsole';

// The options page depends on the context object in order to generate correct links and perform requests against Reddit
Context.retrieveFromParent().then(async () => {
	allowedModules.push('nightMode', 'notifications');

	Core.init();

	await Promise.all([Core.loadI18n, Core.loadOptions]);

	SettingsConsole.start();

	// Signal to settingsNavigation that it seems to be going well
	window.parent.postMessage({ loadSuccess: true }, '*');
}).catch(e => {
	console.error(e);
	window.parent.postMessage({ failedToLoad: true }, '*');
});
