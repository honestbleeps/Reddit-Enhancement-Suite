/* @flow */

import test from 'ava';

import { getOldRedditUrl } from '../oldRedditRedirect.js';

test('redirects reddit.com to old.reddit.com', t => {
	t.is(
		getOldRedditUrl('https://reddit.com/r/Enhancement/?sort=new#comments'),
		'https://old.reddit.com/r/Enhancement/?sort=new#comments',
	);
});

test('redirects www.reddit.com to old.reddit.com', t => {
	t.is(
		getOldRedditUrl('https://www.reddit.com/user/example'),
		'https://old.reddit.com/user/example',
	);
});

test('does not redirect other reddit hosts', t => {
	t.is(getOldRedditUrl('https://old.reddit.com/r/Enhancement/'), null);
	t.is(getOldRedditUrl('https://new.reddit.com/r/Enhancement/'), null);
	t.is(getOldRedditUrl('https://mod.reddit.com/'), null);
});
