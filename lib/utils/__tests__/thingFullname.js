/* @flow */

import test from 'ava';

import { isValidThingFullname } from '../thingFullname.js';

test('valid Reddit thing fullnames may have variable-length IDs', t => {
	for (const fullname of [
		't1_abcdef',
		't3_abcdef',
		't3_1ul533q',
		't5_2qh0u',
	]) {
		t.true(isValidThingFullname(fullname), `${fullname} should be valid`);
	}
});

test('invalid or placeholder thing fullnames are rejected', t => {
	for (const fullname of [
		'',
		't3_',
		't3_invalid-id',
		'placeholder',
	]) {
		t.false(isValidThingFullname(fullname), `${fullname} should be invalid`);
	}
});
