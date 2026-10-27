/* @flow */

import test from 'ava';

import { isRedditOrigin } from '../messageOrigins.js';
import { loadModule } from './helpers/loadModule.js';

async function createContext() {
	const listeners = new Set();
	const sent = [];
	const parent = { postMessage: (...args) => sent.push(args) };
	const window = {
		parent,
		addEventListener: (type, listener) => listeners.add(listener),
		removeEventListener: (type, listener) => listeners.delete(listener),
	};
	const context = await loadModule(new URL('../context.js', import.meta.url), {
		'../../utils/user': 'export const loggedInUser = () => undefined; export const loggedInUserHash = async () => undefined;',
		'../../utils/pagePhases': 'export const contentStart = Promise.resolve();',
	}, {
		window,
		document: { referrer: '' },
		location: { protocol: 'chrome-extension:', origin: 'chrome-extension://res', pathname: '/options.html' },
	});

	return {
		context,
		window,
		parent,
		listeners,
		sent,
		dispatch(event) {
			for (const listener of listeners) listener(event);
		},
	};
}

for (const value of [undefined, null, 'user']) {
	test(`context handshake accepts optional user fields: ${String(value)}`, async t => {
		const frame = await createContext();
		const ready = frame.context.retrieveFromParent();
		frame.dispatch({
			source: frame.parent,
			origin: 'https://old.reddit.com',
			data: { context: { origin: 'https://old.reddit.com', pathname: '/', username: value, userHash: value } },
		});

		t.is(frame.listeners.size, 0);
		await ready;
		t.is(frame.context.data.username, value);
		t.is(frame.context.data.userHash, value);
		frame.context.postMessageToParent({ loadSuccess: true });
		t.is(frame.sent[0][1], 'https://old.reddit.com');
	});
}

test('context handshake ignores untrusted and malformed messages before accepting the parent', async t => {
	const frame = await createContext();
	const ready = frame.context.retrieveFromParent();
	const message = {
		source: frame.parent,
		origin: 'https://old.reddit.com',
		data: { context: { origin: 'https://old.reddit.com', pathname: '/', username: undefined, userHash: undefined } },
	};
	const invalidMessages = [
		{ ...message, source: {} },
		{ ...message, origin: 'https://example.com' },
		{ ...message, data: null },
		{ ...message, data: { context: { ...message.data.context, origin: 'https://www.reddit.com' } } },
		{ ...message, data: { context: { ...message.data.context, username: 42 } } },
		{ ...message, data: { context: { ...message.data.context, userHash: {} } } },
	];
	for (const invalid of invalidMessages) {
		frame.dispatch(invalid);
		t.is(frame.listeners.size, 1);
	}

	frame.dispatch(message);
	await ready;
	t.true(frame.context.isMessageFromParent(message));
	t.false(frame.context.isMessageFromParent({ ...message, origin: 'https://www.reddit.com' }));
	t.true(frame.context.isMessageFromCurrentWindow({ source: frame.window, origin: 'chrome-extension://res' }));
	t.false(frame.context.isMessageFromCurrentWindow({ source: {}, origin: 'chrome-extension://res' }));
	t.false(frame.context.isMessageFromCurrentWindow({ source: frame.window, origin: 'https://old.reddit.com' }));
});

test('isRedditOrigin accepts secure Reddit origins', t => {
	t.true(isRedditOrigin('https://www.reddit.com'));
	t.true(isRedditOrigin('https://en.reddit.com'));
	t.true(isRedditOrigin('https://reddit.com'));
});

test('isRedditOrigin rejects deceptive or insecure origins', t => {
	t.false(isRedditOrigin('http://www.reddit.com'));
	t.false(isRedditOrigin('https://reddit.com.example.com'));
	t.false(isRedditOrigin('https://example.com'));
	t.false(isRedditOrigin('null'));
	t.false(isRedditOrigin(null));
});
