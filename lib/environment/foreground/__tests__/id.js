/* @flow */

import test from 'ava';

import { getOptionsURL, getURL } from '../id.js';

function installChrome(t) {
	const previousChrome = global.chrome;
	global.chrome = {
		runtime: {
			base: 'safari-web-extension://example/',
			getURL(path) {
				return `${this.base}${path}`;
			},
			id: 'example',
		},
	};
	t.teardown(() => {
		global.chrome = previousChrome;
	});
}

test.serial('getURL preserves the runtime context', t => {
	installChrome(t);

	t.is(getURL('options.html'), 'safari-web-extension://example/options.html');
});

test.serial('getOptionsURL builds against the extension page URL', t => {
	installChrome(t);

	t.is(getOptionsURL('#test').href, 'safari-web-extension://example/options.html#test');
});
