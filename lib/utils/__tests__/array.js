/* eslint-disable prefer-reflect, prefer-bind-operator/prefer-bind-operator */

import test from 'ava';

import {
	asyncEvery,
	asyncFilter,
	asyncFind,
	asyncReduce,
	asyncSome,
	forEachSeq,
	invokeAll,
} from '../array';

test('invokeAll', t => {
	t.plan(5);

	const p = () => t.pass();

	[p, p, p]::invokeAll();

	[(a, b) => { a(); b(); }]::invokeAll(p, p);
});

test('forEachSeq', async t => {
	t.plan(3);

	let i = 0;
	await [0, 1, 2]::forEachSeq(j => {
		t.is(i, j);
		return Promise.resolve().then(() => ++i);
	});
});

test('asyncFilter', async t => {
	t.deepEqual(await [1, 2, 3, 4, 5]::asyncFilter(x => x % 2), [1, 3, 5]);
	t.deepEqual(await [1, 2, 3, 4, 5]::asyncFilter(x => Promise.resolve(x % 2)), [1, 3, 5]);
	await t.throws([1]::asyncFilter(() => Promise.reject(new Error('7'))), '7');
});

test('asyncReduce', async t => {
	t.is(await [1, 2, 3]::asyncReduce((a, b) => Promise.resolve(a + b), 4), 10);
});

test('asyncFind', async t => {
	t.is(await [0, 1, 2]::asyncFind(x => x), 1);
	t.is(await [0, 1, 2]::asyncFind(x => Promise.resolve(x)), 1);
});

test('asyncSome', async t => {
	t.is(await []::asyncSome(x => Promise.resolve(x)), false);
	t.is(await [true]::asyncSome(x => Promise.resolve(x)), true);
	t.is(await [false]::asyncSome(x => Promise.resolve(x)), false);
	t.is(await [false, true, false]::asyncSome(x => Promise.resolve(x)), true);
	t.is(await [false, false, false]::asyncSome(x => Promise.resolve(x)), false);

	// .call to avoid an absurd Acorn/power-assert bug with the bind operator
	t.is(await asyncSome.call([0, 1, 2], x => Promise.resolve(x)), true);
	t.is(await asyncSome.call([0, 0, 0], x => Promise.resolve(x)), false);

	await t.throws(asyncSome.call([Promise.reject(new Error('error message'))], x => x), 'error message');

	// short-circuits even when promise never resolves
	t.is(await asyncSome.call([new Promise(() => {}), Promise.resolve(1)], x => x), true);
});

test('asyncEvery', async t => {
	t.is(await []::asyncEvery(x => Promise.resolve(x)), true);
	t.is(await [true]::asyncEvery(x => Promise.resolve(x)), true);
	t.is(await [false]::asyncEvery(x => Promise.resolve(x)), false);
	t.is(await [false, true, false]::asyncEvery(x => Promise.resolve(x)), false);
	t.is(await [true, true, true]::asyncEvery(x => Promise.resolve(x)), true);

	t.is(await asyncEvery.call([0, 1, 2], x => Promise.resolve(x)), false);
	t.is(await asyncEvery.call([1, 1, 1], x => Promise.resolve(x)), true);

	await t.throws(asyncEvery.call([Promise.reject(new Error('error message'))], x => x), 'error message');

	// short-circuits even when promise never resolves
	t.is(await asyncEvery.call([new Promise(() => {}), Promise.resolve(0)], x => x), false);
});

