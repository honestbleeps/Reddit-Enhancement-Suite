/* @flow */

import test from 'ava';

import {
	extractCaptionFromPostMetadata,
	getPostCaption,
} from '../vredditCaption.js';
import {
	buildSafariHlsVideoSources,
	buildVredditVideoSources,
} from '../vredditSource.js';

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

test('buildVredditVideoSources prefers HLS on Safari for audio-bearing videos', t => {
	const result = buildVredditVideoSources({
		buildTarget: 'safari',
		dashManifest: '<MPD />',
		hasAudio: true,
		hlsAvailable: true,
		id: 'abc123',
		mp4Sources: ['https://v.redd.it/abc123/video.mp4'],
	});

	t.is(result.transport, 'hls');
	t.false(result.muted);
	t.deepEqual(result.sources, [{
		source: 'https://v.redd.it/abc123/HLSPlaylist.m3u8',
		type: 'application/vnd.apple.mpegurl',
	}]);
});

test('buildSafariHlsVideoSources returns a Safari-native HLS source tuple', t => {
	const result = buildSafariHlsVideoSources('https://v.redd.it/abc123/HLSPlaylist.m3u8');

	t.deepEqual(result, {
		muted: false,
		sources: [{
			source: 'https://v.redd.it/abc123/HLSPlaylist.m3u8',
			type: 'application/vnd.apple.mpegurl',
		}],
		transport: 'hls',
	});
});

test('buildVredditVideoSources falls back to DASH outside Safari and to MP4 for muted videos', t => {
	t.is(buildVredditVideoSources({
		buildTarget: 'chrome',
		dashManifest: '<MPD />',
		hasAudio: true,
		hlsAvailable: true,
		id: 'abc123',
		mp4Sources: ['https://v.redd.it/abc123/video.mp4'],
	}).transport, 'dash');

	const muted = buildVredditVideoSources({
		buildTarget: 'safari',
		dashManifest: '<MPD />',
		hasAudio: false,
		hlsAvailable: true,
		id: 'abc123',
		mp4Sources: ['https://v.redd.it/abc123/video.mp4'],
	});

	t.is(muted.transport, 'mp4');
	t.true(muted.muted);
	t.deepEqual(muted.sources, [{
		source: 'https://v.redd.it/abc123/video.mp4',
		type: 'video/mp4',
	}]);
});
