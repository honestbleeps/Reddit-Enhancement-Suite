/* @flow */

import test from 'ava';

import { getNativeExpandoOptions } from '../nativeExpando.js';

function checkReplacement(t, moduleID, nativeOpen, forceReplace, expected) {
	const host = {
		moduleID,
		options: forceReplace === undefined ? undefined : { forceReplaceNativeExpando: { value: forceReplace } },
	};
	t.deepEqual(getNativeExpandoOptions(host, nativeOpen), expected);
}

test('replace open Reddit galleries and keep them expanded', checkReplacement,
	'redditgallery', true, undefined, { replace: true, expand: true });

test('collapsed Reddit galleries do not force expansion', checkReplacement,
	'redditgallery', false, undefined, { replace: true, expand: false });

test('Reddit gallery replacement does not require the video force-replace option', checkReplacement,
	'redditgallery', true, false, { replace: true, expand: true });

test('replace open Reddit images and keep them expanded', checkReplacement,
	'ireddit', true, undefined, { replace: true, expand: true });

test('collapsed Reddit images do not force expansion', checkReplacement,
	'ireddit', false, undefined, { replace: true, expand: false });

test('replace open native images when using the fallback image handler', checkReplacement,
	'defaultImage', true, undefined, { replace: true, expand: true });

test('collapsed native images can still be replaced', checkReplacement,
	'defaultImage', false, undefined, { replace: true, expand: false });

test('open native videos are preserved when force-replace is disabled', checkReplacement,
	'vreddit', true, false, { replace: false, expand: false });

test('force-replaced videos do not inherit gallery auto-expansion', checkReplacement,
	'vreddit', true, true, { replace: true, expand: false });

test('collapsed videos can still be replaced when force-replace is disabled', checkReplacement,
	'vreddit', false, false, { replace: true, expand: false });
