/* @flow */

import test from 'ava';

import { loadModule } from '../../environment/foreground/__tests__/helpers/loadModule.js';

const ATTEMPTED_KEY = 'RESoldRedditOptOutAttempted';

async function run({ cookie = 'foo=bar; csrf_token=abc%3D123; baz=1', appType = 'd2x', response = { data: {} }, storage = {} }: any = {}) {
	const requests = [];
	const reloads = [];
	const errors = [];
	const optOut = await loadModule(new URL('../oldRedditRedirect.js', import.meta.url), {
		'../core/module': 'export class Module {}',
		'../environment': 'export const ajax = options => globalThis.__ajax(options);',
		'../utils': 'export const isAppType = type => globalThis.__appType === type;',
	}, {
		location: { reload: () => reloads.push(true) },
		sessionStorage: {
			getItem: key => (Object.hasOwn(storage, key) ? storage[key] : null),
			setItem: (key, value) => { storage[key] = value; },
		},
		document: { cookie },
		console: { error: (...args) => errors.push(args) },
		__appType: appType,
		__ajax: options => {
			requests.push(options);
			return typeof response === 'function' ? response() : Promise.resolve(response);
		},
	});
	await optOut.module.contentStart();
	return { requests, reloads, errors, storage };
}

test('posts the opt-out preference with the csrf token and reloads', async t => {
	const { requests, reloads, errors, storage } = await run();

	t.is(requests.length, 1);
	t.is(requests[0].method, 'POST');
	t.is(requests[0].url, 'https://www.reddit.com/svc/shreddit/graphql');
	t.is(requests[0].headers['Content-Type'], 'application/json');
	t.deepEqual(JSON.parse(requests[0].data), {
		operation: 'UpdateAccountPreferences',
		variables: { input: { isInRedesignBeta: false } },
		csrf_token: 'abc=123',
	});
	t.is(reloads.length, 1);
	t.is(errors.length, 0);
	t.is(storage[ATTEMPTED_KEY], 'true');
});

test('does nothing on old Reddit', async t => {
	const { requests, reloads } = await run({ appType: 'r2' });
	t.is(requests.length + reloads.length, 0);
});

test('does nothing when logged out', async t => {
	await Promise.all(['', 'foo=bar', 'csrf_token=', 'xcsrf_token=abc'].map(async cookie => {
		const { requests, reloads, storage } = await run({ cookie });
		t.is(requests.length + reloads.length, 0, `cookie "${cookie}" is ignored`);
		t.false(Object.hasOwn(storage, ATTEMPTED_KEY));
	}));
});

test('only attempts once per browsing session', async t => {
	const { requests, reloads } = await run({ storage: { [ATTEMPTED_KEY]: 'true' } });
	t.is(requests.length + reloads.length, 0);
});

test('does not reload when the opt-out fails', async t => {
	await Promise.all([
		() => Promise.reject(new Error('403')),
		{ errors: [{ message: 'unauthorized' }] },
	].map(async response => {
		const { requests, reloads, errors } = await run({ response });
		t.is(requests.length, 1);
		t.is(reloads.length, 0);
		t.is(errors.length, 1);
	}));
});
