/* @flow */

import test from 'ava';

import {
	sendRuntimeMessageForBrowser,
	sendTabMessageForBrowser,
} from '../messageTransport.js';

test('sendRuntimeMessageForBrowser uses the callback sender outside Safari', async t => {
	let browserRuntimeCalled = false;
	let chromeRuntimeCalled = false;

	const value = await sendRuntimeMessageForBrowser({ type: 'ping' }, {
		isSafari: false,
		callbackSendMessage: payload => Promise.resolve({ transport: 'callback', payload }),
		browserRuntime: {
			sendMessage: payload => {
				browserRuntimeCalled = true;
				return Promise.resolve(payload);
			},
		},
		chromeRuntimeSendMessage: payload => {
			chromeRuntimeCalled = true;
			return payload;
		},
	});

	t.deepEqual(value, { transport: 'callback', payload: { type: 'ping' } });
	t.false(browserRuntimeCalled);
	t.false(chromeRuntimeCalled);
});

test('sendRuntimeMessageForBrowser uses browser.runtime.sendMessage on Safari when available', async t => {
	const value = await sendRuntimeMessageForBrowser({ type: 'ping' }, {
		isSafari: true,
		callbackSendMessage: () => {
			throw new Error('callback sender should not be used on Safari');
		},
		browserRuntime: {
			sendMessage: payload => Promise.resolve({ transport: 'browser', payload }),
		},
		chromeRuntimeSendMessage: () => {
			throw new Error('chrome runtime sender should not be used when browser.runtime is available');
		},
	});

	t.deepEqual(value, { transport: 'browser', payload: { type: 'ping' } });
});

test('sendRuntimeMessageForBrowser falls back to chrome.runtime.sendMessage promises on Safari', async t => {
	const value = await sendRuntimeMessageForBrowser({ type: 'ping' }, {
		isSafari: true,
		callbackSendMessage: () => {
			throw new Error('callback sender should not be used on Safari');
		},
		browserRuntime: null,
		chromeRuntimeSendMessage: payload => Promise.resolve({ transport: 'chrome-promise', payload }),
	});

	t.deepEqual(value, { transport: 'chrome-promise', payload: { type: 'ping' } });
});

test('sendRuntimeMessageForBrowser rejects when Safari does not expose a promise-based sender', async t => {
	await t.throwsAsync(
		sendRuntimeMessageForBrowser({ type: 'ping' }, {
			isSafari: true,
			callbackSendMessage: () => {
				throw new Error('callback sender should not be used on Safari');
			},
			browserRuntime: null,
			chromeRuntimeSendMessage: () => undefined,
		}),
		{ message: 'Safari runtime.sendMessage did not return a Promise.' },
	);
});

test('sendTabMessageForBrowser uses the callback sender outside Safari', async t => {
	let browserTabsCalled = false;
	let chromeTabsCalled = false;

	const value = await sendTabMessageForBrowser(7, { type: 'ping' }, {
		isSafari: false,
		callbackSendMessage: (tabId, payload) => Promise.resolve({ transport: 'callback', tabId, payload }),
		browserTabs: {
			sendMessage: () => {
				browserTabsCalled = true;
				return Promise.resolve(null);
			},
		},
		chromeTabsSendMessage: () => {
			chromeTabsCalled = true;
			return null;
		},
	});

	t.deepEqual(value, { transport: 'callback', tabId: 7, payload: { type: 'ping' } });
	t.false(browserTabsCalled);
	t.false(chromeTabsCalled);
});

test('sendTabMessageForBrowser uses browser.tabs.sendMessage on Safari when available', async t => {
	const value = await sendTabMessageForBrowser(7, { type: 'ping' }, {
		isSafari: true,
		callbackSendMessage: () => {
			throw new Error('callback sender should not be used on Safari');
		},
		browserTabs: {
			sendMessage: (tabId, payload) => Promise.resolve({ transport: 'browser', tabId, payload }),
		},
		chromeTabsSendMessage: () => {
			throw new Error('chrome tabs sender should not be used when browser.tabs is available');
		},
	});

	t.deepEqual(value, { transport: 'browser', tabId: 7, payload: { type: 'ping' } });
});

test('sendTabMessageForBrowser falls back to chrome.tabs.sendMessage promises on Safari', async t => {
	const value = await sendTabMessageForBrowser(7, { type: 'ping' }, {
		isSafari: true,
		callbackSendMessage: () => {
			throw new Error('callback sender should not be used on Safari');
		},
		browserTabs: null,
		chromeTabsSendMessage: (tabId, payload) => Promise.resolve({ transport: 'chrome-promise', tabId, payload }),
	});

	t.deepEqual(value, { transport: 'chrome-promise', tabId: 7, payload: { type: 'ping' } });
});

test('sendTabMessageForBrowser rejects when Safari does not expose a promise-based tab sender', async t => {
	await t.throwsAsync(
		sendTabMessageForBrowser(7, { type: 'ping' }, {
			isSafari: true,
			callbackSendMessage: () => {
				throw new Error('callback sender should not be used on Safari');
			},
			browserTabs: null,
			chromeTabsSendMessage: () => undefined,
		}),
		{ message: 'Safari tabs.sendMessage did not return a Promise.' },
	);
});
