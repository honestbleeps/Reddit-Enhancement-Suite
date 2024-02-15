/* @flow */

import test from 'ava';

import { colorToArray, colorFromArray } from '../color.js';

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

	t.is(from([170, 187, 204]), '#aabbcc');
	t.is(from([170, 187, 204]), '#aabbcc');
	t.is(from([1, 2, 3]), '#010203');
	t.is(from([255, 255, 255]), '#ffffff');
	t.is(from([0, 0, 0]), '#000000');
});
