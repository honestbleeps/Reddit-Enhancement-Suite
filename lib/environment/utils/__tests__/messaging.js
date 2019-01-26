/* @flow */

/* eslint-disable ava/use-test */
import anyTest from 'ava';
import type { TestInterface } from 'ava';
/* eslint-enable ava/use-test */

import { createMessageHandler } from '../messaging';

const test: TestInterface<{ _realConsoleError: * }> = (anyTest: any);

test.before(t => {
	t.context._realConsoleError = console.error;
	// $FlowIgnore
	console.error = () => {};
});

test.after(t => {
	// $FlowIgnore
	console.error = t.context._realConsoleError;
});

function createPair() {
	// Simultates foreground listener
	const { _handleMessage: _handleMessageB, ...a } = createMessageHandler((info, context) =>
		new Promise(resolve => _handleMessageA(info, resolve, context))
	);

	// Simultates background listener
	const { _handleMessage: _handleMessageA, ...b } = createMessageHandler((info, context) => (
		new Promise(resolve => _handleMessageB(info, resolve, context))
	), true);

	return { a, b };
}

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

	await t.throwsAsync(sendMessage('throwError'), 'foo');
	await t.throwsAsync(sendMessage('rejectPromise'), 'bar');
});

test('backend listener invalid type', async t => {
	const { a: { sendMessage } } = createPair();
	await t.throwsAsync(sendMessage('foobar'), /foobar/);
});
