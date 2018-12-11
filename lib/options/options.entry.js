/* @flow */

import { ALLOWED_MODULES_KEY } from '../constants/sessionStorage';

import * as Context from '../environment/foreground/context';
import { init, loadOptions } from '../core/init';
import { start } from './settingsConsole';

sessionStorage.setItem(ALLOWED_MODULES_KEY, JSON.stringify(['nightMode', 'notifications']));

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
	init();
	loadOptions.then(start);
});
