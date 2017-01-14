/* @flow */

import test from 'ava';

import { firstValid } from '../value';

test('firstValid', t => {
	t.is(firstValid(null, undefined, 'foo'), 'foo');
	t.is(firstValid(null, undefined, NaN, Infinity), Infinity);
});
