/* @flow */

import test from 'ava';

import { firstValid } from '../value.js';

test('firstValid', t => {
	t.is(firstValid(null, undefined, 'foo'), 'foo');
	t.is(firstValid(null, undefined, NaN, Infinity), Infinity);
});
