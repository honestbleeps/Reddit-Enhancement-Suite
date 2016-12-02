/* @flow */

import test from 'ava';

import { createMessageHandler } from '../_messaging';

function createPair(onListenerError) {
	const { _handleMessage: _handleMessageA, ...a } = createMessageHandler((type, info, context) => {
		Promise.resolve().then(() => _handleMessageB(type, info, context));
	}, onListenerError);

	const { _handleMessage: _handleMessageB, ...b } = createMessageHandler((type, info, context) => {
		Promise.resolve().then(() => _handleMessageA(type, info, context));
	}, onListenerError);

	return { a, b };
}

test('context for sending responses', t => {
	t.plan(1);
	const { _handleMessage, addListener } = createMessageHandler((type, info, context) => {
		t.is(context, 7);
	});
	addListener('foo', x => x);
	_handleMessage('foo', { transaction: 0 }, 7);
});

test('adding duplicate listener', t => {
	const { a: { addListener } } = createPair();

	addListener('foobar', () => {});
	t.throws(() => addListener('foobar', () => {}), /foobar/);
});

test('adding duplicate interceptor', t => {
	const { a: { addInterceptor } } = createPair();

	addInterceptor('foobar', () => {});
	t.throws(() => addInterceptor('foobar', () => {}), /foobar/);
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

test('interceptor', async t => {
	const { a: { addInterceptor, sendMessage } } = createPair();
	addInterceptor('addTwo', x => x + 2);

	const response = sendMessage('addTwo', 3);
	t.true(typeof response.then === 'function', 'response is a promise');
	t.is(await response, 5);
});

test('interceptor returning a promise', async t => {
	const { a: { addInterceptor, sendMessage } } = createPair();
	addInterceptor('addTwo', x => Promise.resolve(x + 2));

	const response = sendMessage('addTwo', 3);
	t.true(typeof response.then === 'function', 'response is a promise');
	t.is(await response, 5);
});

test('interceptor with context', async t => {
	const { a: { addInterceptor, sendMessage } } = createPair();
	addInterceptor('addOnePlusContext', (x, context) => x + 1 + context);

	t.is(await sendMessage('addOnePlusContext', 3, 5), 9);
});

test('mixed backend handler and interceptors', async t => {
	const { a: { addInterceptor, sendMessage }, b: { addListener } } = createPair();
	addListener('addOne', x => x + 1);
	addInterceptor('addTwo', x => x + 2);

	t.is(await sendMessage('addOne', 3), 4);
	t.is(await sendMessage('addTwo', 3), 5);
});

test('interceptor preempts backend listener', t => {
	t.plan(1);
	const { a: { addInterceptor, sendMessage }, b: { addListener } } = createPair();
	addListener('foo', () => t.fail());
	addInterceptor('foo', () => t.pass());
	sendMessage('foo');
});

test('synchronous interceptor', t => {
	const { a: { addInterceptor, sendSynchronous } } = createPair();
	addInterceptor('addThree', x => x + 3);
	t.is(sendSynchronous('addThree', 2), 5);
});

test('synchronous interceptor with context', t => {
	const { a: { addInterceptor, sendSynchronous } } = createPair();
	addInterceptor('addOnePlusContext', (x, context) => x + 1 + context);

	t.is(sendSynchronous('addOnePlusContext', 3, 5), 9);
});

test('erroring backend handler', async t => {
	t.plan(4);
	const { a: { sendMessage }, b: { addListener } } = createPair(() => t.pass());
	addListener('throwError', () => { throw new Error('foo'); });
	addListener('rejectPromise', () => Promise.reject(new Error('bar')));

	await t.throws(sendMessage('throwError'), 'Error in target\'s "throwError" handler: foo');
	await t.throws(sendMessage('rejectPromise'), 'Error in target\'s "rejectPromise" handler: bar');
});

test('erroring interceptor', async t => {
	const { a: { addInterceptor, sendMessage } } = createPair();
	addInterceptor('throwError', () => { throw new Error('foo'); });
	addInterceptor('rejectPromise', () => Promise.reject(new Error('bar')));

	await t.throws(sendMessage('throwError'), 'Error in "throwError" interceptor: foo');
	await t.throws(sendMessage('rejectPromise'), 'Error in "rejectPromise" interceptor: bar');
});

test('erroring synchronous interceptor', t => {
	const { a: { addInterceptor, sendSynchronous } } = createPair();
	addInterceptor('throwError', () => { throw new Error('foo'); });

	t.throws(() => sendSynchronous('throwError'), 'Error in "throwError" interceptor: foo');
});

test('backend listener invalid type', async t => {
	const { a: { sendMessage } } = createPair();
	await t.throws(sendMessage('foobar'), /foobar/);
});

test('synchronous listener invalid type', t => {
	const { a: { sendSynchronous } } = createPair();
	t.throws(() => sendSynchronous('foobar'), /foobar/);
});
