/* @flow */

import test from 'ava';

import { getOldRedditUrl } from '../oldRedditRedirect.js';

test('builds Old Reddit redirect URLs', t => {
	const cases: Array<[string, ?string]> = [
		[
			'https://reddit.com/r/Enhancement/?sort=new#comments',
			'https://old.reddit.com/r/Enhancement/?sort=new#comments',
		],
		[
			'https://www.reddit.com/user/example',
			'https://old.reddit.com/user/example',
		],
		['https://old.reddit.com/r/Enhancement/', null],
		['https://new.reddit.com/r/Enhancement/', null],
		['https://mod.reddit.com/', null],
	];

	for (const [currentUrl, expectedUrl] of cases) {
		t.is(getOldRedditUrl(currentUrl), expectedUrl, currentUrl);
	}
});
