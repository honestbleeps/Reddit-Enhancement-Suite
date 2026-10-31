/* @flow */

import test from 'ava';

import { loadModule } from '../../environment/foreground/__tests__/helpers/loadModule.js';

const ATTEMPTED_KEY = 'RESmodules.oldRedditRedirect.attempted';

const STORAGE_MOCK = `
export const Storage = {
	wrap: (key, defaultValue) => ({
		get: async () => (Object.hasOwn(globalThis.__storage, key) ? globalThis.__storage[key] : defaultValue),
		set: async value => { globalThis.__storage[key] = value; },
		delete: async () => { delete globalThis.__storage[key]; },
	}),
};
export const ajax = options => globalThis.__ajax(options);
`;

async function setup({ cookie = 'foo=bar; csrf_token=abc%3D123; baz=1', appType = 'd2x', response = { data: {} }, storage = {} }: any = {}) {
	const requests = [];
	const reloads = [];
	const errors = [];
	const { module } = await loadModule(new URL('../oldRedditRedirect.js', import.meta.url), {
		'../core/module': 'export class Module {}',
		'../environment': STORAGE_MOCK,
		'../utils': 'export const isAppType = type => globalThis.__appType === type;',
	}, {
		location: { reload: () => reloads.push(true) },
		document: { cookie },
		console: { error: (...args) => errors.push(args) },
		__storage: storage,
		__appType: appType,
		__ajax: options => {
			requests.push(options);
			return typeof response === 'function' ? response() : Promise.resolve(response);
		},
	});
	return { module, requests, reloads, errors, storage };
}

async function run(options: any) {
	const result = await setup(options);
	await result.module.contentStart();
	return result;
}

test('posts the opt-out preference with the csrf token and reloads', async t => {
	const { requests, reloads, errors, storage } = await run();

	t.is(requests.length, 2);
	t.is(requests[0].method, 'POST');
	t.is(requests[0].url, 'https://www.reddit.com/svc/shreddit/graphql');
	t.is(requests[0].headers['Content-Type'], 'application/json');
	t.deepEqual(JSON.parse(requests[0].data), {
		operation: 'UpdateAccountPreferences',
		variables: { input: { isInRedesignBeta: false } },
		csrf_token: 'abc=123',
	});
	t.is(requests[1].method, undefined);
	t.is(requests[1].url, 'https://www.reddit.com/prefs?ext-referrer=DIRECT');
	t.is(reloads.length, 1);
	t.is(errors.length, 0);
	t.true(storage[ATTEMPTED_KEY]);
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

test('only attempts once until the module is toggled', async t => {
	const { module, requests, reloads } = await run({ response: () => Promise.reject(new Error('403')) });
	t.is(requests.length, 1);

	await module.contentStart();
	t.is(requests.length, 1, 'not retried on later page loads');

	await module.onToggle(false);
	await module.onToggle(true);
	await module.contentStart();
	t.is(requests.length, 2, 'retried after toggling off and on');
	t.is(reloads.length, 0);
});

test('does nothing when already attempted', async t => {
	const { requests, reloads } = await run({ storage: { [ATTEMPTED_KEY]: true } });
	t.is(requests.length + reloads.length, 0);
});

test('does not reload when the opt-out fails', async t => {
	await Promise.all([
		() => Promise.reject(new Error('403')),
		{ errors: [{ message: 'unauthorized' }] },
	].map(async response => {
		const { requests, reloads, errors } = await run({ response });
		t.is(requests.length, 1, 'prefs page is not requested');
		t.is(reloads.length, 0);
		t.is(errors.length, 1);
	}));
});
