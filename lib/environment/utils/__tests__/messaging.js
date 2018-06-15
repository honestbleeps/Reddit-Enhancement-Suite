/* @noflow */

import test from 'ava';

import { createMessageHandler } from '../messaging';

function createPair() {
	const { _handleMessage: _handleMessageA, ...a } = createMessageHandler((info, context) =>
		new Promise(resolve => _handleMessageB(info, resolve, context))
	);

	const { _handleMessage: _handleMessageB, ...b } = createMessageHandler((info, context) =>
		new Promise(resolve => _handleMessageA(info, resolve, context))
	);

	return { a, b };
}

test.beforeEach(t => {
	t.context._realConsoleError = console.error;
	// $FlowIgnore
	console.error = () => {};
});

test.afterEach(t => {
	// $FlowIgnore
	console.error = t.context._realConsoleError;
});

test('adding duplicate listener', t => {
	const { a: { addListener } } = createPair();

	addListener('foobar', () => {});
	t.throws(() => addListener('foobar', () => {}), /foobar/);
});

test('backend handler', async t => {
	const { a: { sendMessage }, b: { addListener } } = createPair();
	addListener('addOne', x => x + 1);

	const response = sendMessage('addOne', 3);
	t.true(typeof response.then === 'function', 'response is a promise');
	t.is(await response, 4);
});

test('backend handler returning a promise', async t => {
	const { a: { sendMessage }, b: { addListener } } = createPair();
	addListener('addOne', x => Promise.resolve(x + 1));

	const response = sendMessage('addOne', 3);
	t.true(typeof response.then === 'function', 'response is a promise');
	t.is(await response, 4);
});

test('backend handler with context', async t => {
	const { a: { sendMessage }, b: { addListener } } = createPair();
	addListener('addOnePlusContext', (x, context) => x + 1 + context);

	t.is(await sendMessage('addOnePlusContext', 3, 5), 9);
});

test('erroring backend handler', async t => {
	const { a: { sendMessage }, b: { addListener } } = createPair();
	addListener('throwError', () => { throw new Error('foo'); });
	addListener('rejectPromise', () => Promise.reject(new Error('bar')));

	await t.throws(sendMessage('throwError'), 'foo');
	await t.throws(sendMessage('rejectPromise'), 'bar');
});

test('backend listener invalid type', async t => {
	const { a: { sendMessage } } = createPair();
	await t.throws(sendMessage('foobar'), /foobar/);
});
