import test from 'ava';

import {
	range,
	repeatWhile,
	zip,
} from '../generator';

function c(arr) {
	return Array.from(arr);
}

test('range', t => {
	t.deepEqual(c(range(0, 3)), [0, 1, 2]);
	t.deepEqual(c(range(0, 0)), []);
	t.deepEqual(c(range(-1, 2)), [-1, 0, 1]);
	t.deepEqual(c(range(1, -2)), []);
});

test('repeatWhile', t => {
	t.plan(4); // 3 true + 1 false
	let i = 0;
	c(repeatWhile(() => {
		t.pass();
		return i++ < 3;
	}));
});

test('zip', t => {
	t.deepEqual(c(zip([1, 2, 3], ['a', 'b', 'c'])), [[1, 'a'], [2, 'b'], [3, 'c']]);
	t.deepEqual(c(zip([1, 2, 3], ['a'])), [[1, 'a'], [2, undefined], [3, undefined]], 'consumes all generators to completion');
	t.deepEqual(c(zip([1, 2, 3], range(4, 7))), [[1, 4], [2, 5], [3, 6]]);
});
