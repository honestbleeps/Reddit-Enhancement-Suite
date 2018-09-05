/* @flow */

import test from 'ava';

import { encode } from '../string';

test('encode', t => {
	t.is(
		encode`https://example.com?url=${'https://reddit.com/r/resissues+enhancement'}`,
		'https://example.com?url=https%3A%2F%2Freddit.com%2Fr%2Fresissues%2Benhancement'
	);
});
