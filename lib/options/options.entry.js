/* @flow */

import './handleBlocking';
import * as Context from '../environment/foreground/context';
import { init, loadOptions } from '../core/init';
import { allowedModules } from '../core/modules';
import { start } from './settingsConsole';

// load environment listeners
import 'sibling-loader!../environment/foreground/messaging';

// The options page depends on the context object in order to generate correct links and perform requests against Reddit
Context.retrieveFromParent().then(async () => {
	allowedModules.push('nightMode', 'notifications');

	init();

	await loadOptions;

	start();

	// Signal to settingsNavigation that it seems to be going well
	window.parent.postMessage({ loadSuccess: true }, '*');
}).catch(e => {
	console.error(e);
	window.parent.postMessage({ failedToLoad: true }, '*');
});
