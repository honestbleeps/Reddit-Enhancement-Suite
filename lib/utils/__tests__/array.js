/* @flow */

import test from 'ava';

import {
	asyncEvery,
	asyncFilter,
	asyncFind,
	asyncReduce,
	asyncSome,
	filterMap,
	forEachSeq,
} from '../array.js';

test('forEachSeq', async t => {
	t.plan(3);

	let i = 0;
	await forEachSeq([0, 1, 2], async j => {
		t.is(i, j);
		await Promise.resolve();
		++i;
	});
});

test('asyncFilter', async t => {
	t.deepEqual(await asyncFilter([1, 2, 3, 4, 5], x => Promise.resolve(x % 2)), [1, 3, 5]);
	await t.throwsAsync(asyncFilter([1], () => Promise.reject(new Error('7'))), { message: '7' });
});

test('asyncReduce', async t => {
	t.is(await asyncReduce([1, 2, 3], (a, b) => Promise.resolve(a + b), 4), 10);
});

test('asyncFind', async t => {
	t.is(await asyncFind([0, 1, 2], x => Promise.resolve(x)), 1);
	t.is(asyncFind([0, 1, 2], x => x), 1);
});

test('asyncSome', async t => {
	t.false(await asyncSome([], x => Promise.resolve(x)));
	t.true(await asyncSome([true], x => Promise.resolve(x)));
	t.false(await asyncSome([false], x => Promise.resolve(x)));
	t.true(await asyncSome([false, true, false], x => Promise.resolve(x)));
	t.false(await asyncSome([false, false, false], x => Promise.resolve(x)));

	t.true(await asyncSome([0, 1, 2], x => Promise.resolve(x)));
	t.false(await asyncSome([0, 0, 0], x => Promise.resolve(x)));

	await t.throwsAsync(asyncSome([Promise.reject(new Error('error message'))], x => x), { message: 'error message' });

	// short-circuits even when promise never resolves
	t.true(await asyncSome([new Promise(() => {}), Promise.resolve(1)], x => x));
});

test('asyncEvery', async t => {
	t.true(await asyncEvery([], x => Promise.resolve(x)));
	t.true(await asyncEvery([true], x => Promise.resolve(x)));
	t.false(await asyncEvery([false], x => Promise.resolve(x)));
	t.false(await asyncEvery([false, true, false], x => Promise.resolve(x)));
	t.true(await asyncEvery([true, true, true], x => Promise.resolve(x)));

	t.false(await asyncEvery([0, 1, 2], x => Promise.resolve(x)));
	t.true(await asyncEvery([1, 1, 1], x => Promise.resolve(x)));

	await t.throwsAsync(asyncEvery([Promise.reject(new Error('error message'))], x => x), { message: 'error message' });

	// short-circuits even when promise never resolves
	t.false(await asyncEvery([new Promise(() => {}), Promise.resolve(0)], x => x));
});

test('filterMap', t => {
	t.deepEqual(filterMap([], () => t.fail()), []);
	t.deepEqual(filterMap([1, 2, 3, 4], x => x % 2 ? [x * 2] : undefined), [2, 6]);
	t.deepEqual(filterMap([1, 2, 3, 4], x => !(x % 2) ? [x * 2] : undefined), [4, 8]);
	t.deepEqual(filterMap([1, 2, 3, 4], x => x > 1 ? [undefined] : undefined), [undefined, undefined, undefined]);
});
