import test from 'ava';

import {
	asyncFilter,
	asyncFind,
	asyncReduce,
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
