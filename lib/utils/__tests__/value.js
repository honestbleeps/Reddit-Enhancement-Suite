/* @flow */

import { firstValid } from '../value';
import test from 'ava';


test('firstValid', t => {
	t.is(firstValid(null, undefined, 'foo'), 'foo');
	t.is(firstValid(null, undefined, NaN, Infinity), Infinity);
});
