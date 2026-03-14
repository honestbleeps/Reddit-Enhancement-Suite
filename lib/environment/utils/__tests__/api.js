/* @flow */

import test from 'ava';

import { apiToPromise } from '../api.js';

function installChrome(t) {
	const previousChrome = global.chrome;
	global.chrome = { runtime: { lastError: null } };
	t.teardown(() => {
		global.chrome = previousChrome;
	});
}

test.serial('apiToPromise resolves callback-based APIs', async t => {
	installChrome(t);

	const value = await apiToPromise((input, callback) => {
		callback(input + 1);
	})((2: any));

	t.is(value, 3);
});

test.serial('apiToPromise resolves promise-returning APIs', async t => {
	installChrome(t);

	const value = await apiToPromise(input => Promise.resolve(input + 1))((2: any));

	t.is(value, 3);
});

test.serial('apiToPromise rejects callback-based errors', async t => {
	installChrome(t);

	const wrapped = apiToPromise((input, callback) => {
		global.chrome.runtime.lastError = { message: `bad:${input}` };
		callback();
		global.chrome.runtime.lastError = null;
	});

	await t.throwsAsync(wrapped((2: any)), { message: 'bad:2' });
});
