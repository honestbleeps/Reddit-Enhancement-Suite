/* @flow */

import test from 'ava';

import { getOldRedditUrl } from '../oldRedditRedirectUtils.js';

test('redirects regular Reddit URLs', t => {
	t.is(
		getOldRedditUrl('https://www.reddit.com/r/Enhancement/?sort=new#comments'),
		'https://old.reddit.com/r/Enhancement/?sort=new#comments',
	);
});

test('does not redirect i.redd.it media pages', t => {
	t.is(
		getOldRedditUrl('https://www.reddit.com/media?url=https%3A%2F%2Fi.redd.it%2Fexample.jpg'),
		null,
	);
});

test('redirects media pages for other hosts', t => {
	t.is(
		getOldRedditUrl('https://www.reddit.com/media?url=https%3A%2F%2Fexample.com%2Fimage.jpg'),
		'https://old.reddit.com/media?url=https%3A%2F%2Fexample.com%2Fimage.jpg',
	);
	t.is(
		getOldRedditUrl('https://www.reddit.com/media?url=not-a-url'),
		'https://old.reddit.com/media?url=not-a-url',
	);
});
