import test from 'ava';

import {
	collect,
	enumerate,
	filter,
	find,
	map,
	range,
	repeatWhile,
	take,
	takeWhile,
	zip,
} from '../generator';

test('enumerate', t => {
	t.deepEqual(['a', 'b', 'c']::enumerate()::collect(), [[0, 'a'], [1, 'b'], [2, 'c']]);
	t.deepEqual(range(2, 4)::enumerate()::collect(), [[0, 2], [1, 3]]);
});

test('filter/map', t => {
	t.deepEqual(range(0, 10)::filter(x => x % 2 === 1)::map(x => x ** 2)::collect(), [1, 9, 25, 49, 81]);
	t.deepEqual(['a', 'b', 'c']::filter(x => x < 'c')::collect(), ['a', 'b']);
	t.deepEqual(['a', 'b', 'c']::map(x => `${x}_`)::collect(), ['a_', 'b_', 'c_']);
});

test('find', t => {
	t.is([1, 2, 3]::find(x => x % 2 === 0), 2, 'found element');
	t.is([1, 2, 3]::find(x => x > 5), undefined, 'not found');

	function* testGen() {
		yield 3;
		t.fail('find() does not consume entire generator');
		yield 4;
	}

	t.is(testGen()::find(x => x === 3), 3);
});

test('repeatWhile', t => {
	t.plan(4); // 3 true + 1 false
	let i = 0;
	repeatWhile(() => {
		t.pass();
		return i++ < 3;
	})::collect();
});

test('take', t => {
	t.deepEqual([1, 2, 3, 4, 5]::take(3)::collect(), [1, 2, 3]);
	t.deepEqual([1, 2, 3, 4, 5]::take(0)::collect(), []);

	t.deepEqual(repeatWhile(() => 10)::take(2)::collect(), [10, 10]);

	function* testGen() {
		t.fail('take(0) does not start generator');
		yield 1;
	}

	t.deepEqual(testGen()::take(0)::collect(), []);
});

test('takeWhile', t => {
	let i = 3;
	t.deepEqual(repeatWhile(() => i--)::takeWhile(x => x > 1)::collect(), [3, 2]);
});

test('zip', t => {
	t.deepEqual(zip([1, 2, 3], ['a', 'b', 'c'])::collect(), [[1, 'a'], [2, 'b'], [3, 'c']]);
	t.deepEqual(zip([1, 2, 3], ['a'])::collect(), [[1, 'a'], [2, undefined], [3, undefined]], 'consumes all generators to completion');
	t.deepEqual(zip([1, 2, 3], range(4, 7))::collect(), [[1, 4], [2, 5], [3, 6]]);
	t.deepEqual(zip(repeatWhile(() => 10)::take(2), ['a', 'b'], [0, 0])::collect(), [[10, 'a', 0], [10, 'b', 0]]);
	t.deepEqual(zip(repeatWhile(() => 5), repeatWhile(() => 4))::take(2)::collect(), [[5, 4], [5, 4]]);
});
