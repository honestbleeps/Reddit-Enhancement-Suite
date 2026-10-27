/* @flow */

import test from 'ava';

import { isRedditOrigin } from '../messageOrigins.js';

test('isRedditOrigin accepts secure Reddit origins', t => {
	t.true(isRedditOrigin('https://www.reddit.com'));
	t.true(isRedditOrigin('https://en.reddit.com'));
	t.true(isRedditOrigin('https://reddit.com'));
});

test('isRedditOrigin rejects deceptive or insecure origins', t => {
	t.false(isRedditOrigin('http://www.reddit.com'));
	t.false(isRedditOrigin('https://reddit.com.example.com'));
	t.false(isRedditOrigin('https://example.com'));
	t.false(isRedditOrigin('null'));
	t.false(isRedditOrigin(null));
});
