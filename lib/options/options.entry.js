/* @flow */

import './handleBlocking';
import * as Context from '../environment/foreground/context';
import { init, loadOptions } from '../core/init';
import { allowedModules } from '../core/modules';
import { start } from './settingsConsole';

// load environment listeners
import 'sibling-loader!../environment/foreground/messaging';

// The options page depends on the context object in order to generate correct links and perform requests against Reddit
new Promise(res => {
	if (window === window.top) {
		// Use default context if the option page is not embedded
		res();
	} else {
		window.addEventListener('message', function waitForContext({ data: { context } }) {
			Object.assign(Context.data, context);
			window.removeEventListener('message', waitForContext, true);
			res();
		}, true);
	}
}).then(() => {
	allowedModules.push('nightMode', 'notifications');
	init();
	loadOptions.then(start);

	if (window !== window.top) {
		// Signal to settingsNavigation that it seems to be going well
		loadOptions.then(() => { window.parent.postMessage({ loadSuccess: true }, '*'); });
	}
});
