/* @flow */

import test from 'ava';

import {
	extractCaptionFromPostMetadata,
	getPostCaption,
} from '../vredditCaption.js';

test('extractCaptionFromPostMetadata prefers the original crosspost caption', t => {
	const caption = extractCaptionFromPostMetadata({
		selftext_html: '<p>outer</p>',
		crosspost_parent_list: [{
			selftext_html: '<p>inner</p>',
		}],
	});

	t.is(caption, 'inner');
});

test('getPostCaption resolves quickly to an empty caption when metadata stalls', async t => {
	const caption = await getPostCaption('t3_abc123', () => new Promise(() => {}), {
		setTimeoutFn(callback) {
			callback();
			return null;
		},
	});

	t.is(caption, '');
});

test('getPostCaption returns caption text when metadata resolves before the timeout', async t => {
	const caption = await getPostCaption('t3_abc123', () => Promise.resolve({
		selftext_html: '<p>combat footage caption</p>',
	}), {
		setTimeoutFn: () => null,
	});

	t.is(caption, 'combat footage caption');
});
