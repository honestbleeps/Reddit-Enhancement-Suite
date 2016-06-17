import test from 'ava';

import { colorToArray, colorFromArray } from '../color';

test('colorToArray', t => {
	const to = colorToArray;

	t.deepEqual(to('#aabbcc'), [170, 187, 204]);
	t.deepEqual(to('#abc'), [170, 187, 204]);
	t.deepEqual(to('rgb(1,2,3)'), [1, 2, 3]);
	t.deepEqual(to('white'), [255, 255, 255]);
	t.deepEqual(to('not a color'), [0, 0, 0]);
});

test('colorFromArray', t => {
	const from = colorFromArray;

	t.deepEqual(from([170, 187, 204]), '#aabbcc');
	t.deepEqual(from([170, 187, 204]), '#aabbcc');
	t.deepEqual(from([1, 2, 3]), '#010203');
	t.deepEqual(from([255, 255, 255]), '#ffffff');
	t.deepEqual(from([0, 0, 0]), '#000000');
});
