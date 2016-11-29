/* @flow */
/* eslint-disable prefer-reflect */

import test from 'ava';

import {
	asyncEvery,
	asyncFilter,
	asyncFind,
	asyncReduce,
	asyncSome,
	filterMap,
	forEachSeq,
} from '../array';

test('forEachSeq', async t => {
	t.plan(3);

	let i = 0;
	await forEachSeq([0, 1, 2], j => {
		t.is(i, j);
		return Promise.resolve().then(() => { ++i; });
	});
});

test('asyncFilter', async t => {
	t.deepEqual(await asyncFilter([1, 2, 3, 4, 5], x => Promise.resolve(x % 2)), [1, 3, 5]);
	await t.throws(asyncFilter([1], () => Promise.reject(new Error('7'))), '7');
});

test('asyncReduce', async t => {
	t.is(await asyncReduce([1, 2, 3], (a, b) => Promise.resolve(a + b), 4), 10);
});

test('asyncFind', async t => {
	t.is(await asyncFind([0, 1, 2], x => Promise.resolve(x)), 1);
	t.is(asyncFind([0, 1, 2], x => x), 1);
});

test('asyncSome', async t => {
	t.is(await asyncSome([], x => Promise.resolve(x)), false);
	t.is(await asyncSome([true], x => Promise.resolve(x)), true);
	t.is(await asyncSome([false], x => Promise.resolve(x)), false);
	t.is(await asyncSome([false, true, false], x => Promise.resolve(x)), true);
	t.is(await asyncSome([false, false, false], x => Promise.resolve(x)), false);

	t.is(await asyncSome([0, 1, 2], x => Promise.resolve(x)), true);
	t.is(await asyncSome([0, 0, 0], x => Promise.resolve(x)), false);

	await t.throws(asyncSome([Promise.reject(new Error('error message'))], x => x), 'error message');

	// short-circuits even when promise never resolves
	t.is(await asyncSome([new Promise(() => {}), Promise.resolve(1)], x => x), true);
});

test('asyncEvery', async t => {
	t.is(await asyncEvery([], x => Promise.resolve(x)), true);
	t.is(await asyncEvery([true], x => Promise.resolve(x)), true);
	t.is(await asyncEvery([false], x => Promise.resolve(x)), false);
	t.is(await asyncEvery([false, true, false], x => Promise.resolve(x)), false);
	t.is(await asyncEvery([true, true, true], x => Promise.resolve(x)), true);

	t.is(await asyncEvery([0, 1, 2], x => Promise.resolve(x)), false);
	t.is(await asyncEvery([1, 1, 1], x => Promise.resolve(x)), true);

	await t.throws(asyncEvery([Promise.reject(new Error('error message'))], x => x), 'error message');

	// short-circuits even when promise never resolves
	t.is(await asyncEvery([new Promise(() => {}), Promise.resolve(0)], x => x), false);
});

test('filterMap', t => {
	t.deepEqual(filterMap([], () => t.fail()), []);
	t.deepEqual(filterMap([1, 2, 3, 4], x => x % 2 ? [x * 2] : undefined), [2, 6]);
	t.deepEqual(filterMap([1, 2, 3, 4], x => !(x % 2) ? [x * 2] : undefined), [4, 8]);
	t.deepEqual(filterMap([1, 2, 3, 4], x => x > 1 ? [undefined] : undefined), [undefined, undefined, undefined]);
});
