/* @flow */

import * as Context from '../environment/foreground/context';
import { init, loadOptions } from '../core/init';
import { allowedModules } from '../core/modules';
import { start } from './settingsConsole';

// The options page depends on the context object in order to generate correct links and perform requests against Reddit
new Promise(res => {
	if (window === window.top) {
		// Use default context if the option page is not embedded
		res();
	} else {
		let sessionStorageBlocked = true;
		try {
			// Chrome throws a exception sessionStorage cannot be accessed
			// This happens when "3rd party cookies" are blocked
			sessionStorageBlocked = !JSON.stringify(sessionStorage);
		} catch (e) {
			if (sessionStorageBlocked) window.parent.postMessage({ redirectToOptions: true, hash: location.hash }, '*');
			return;
		}

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
});
