/* @flow */

import test from 'ava';
import {
	canFallbackToNativeOnInitFailure,
	canFallbackToNativeOnMediaFailure,
	restoreNativeExpando,
} from '../nativeFallback.js';

test('canFallbackToNativeOnInitFailure only enables Safari vreddit fallback when native expando exists', t => {
	t.true(canFallbackToNativeOnInitFailure('vreddit', true, 'safari'));
	t.false(canFallbackToNativeOnInitFailure('vreddit', false, 'safari'));
	t.false(canFallbackToNativeOnInitFailure('imgur', true, 'safari'));
	t.false(canFallbackToNativeOnInitFailure('vreddit', true, 'chrome'));
});

test('canFallbackToNativeOnMediaFailure only enables Safari video fallback when native expando exists', t => {
	t.true(canFallbackToNativeOnMediaFailure('VIDEO', true, 'safari'));
	t.false(canFallbackToNativeOnMediaFailure('IMAGE', true, 'safari'));
	t.false(canFallbackToNativeOnMediaFailure('VIDEO', false, 'safari'));
	t.false(canFallbackToNativeOnMediaFailure('VIDEO', true, 'chrome'));
});

test('restoreNativeExpando reattaches and expands the native expando when the RES expando was active', t => {
	const calls = [];

	t.true(restoreNativeExpando({
		expando: {
			open: true,
			expandWanted: false,
			destroy() { calls.push('destroy'); },
		},
		nativeExpando: {
			open: false,
			reattach() { calls.push('reattach'); },
			expand() { calls.push('expand'); },
		},
		cleanup() { calls.push('cleanup'); },
	}));

	t.deepEqual(calls, ['destroy', 'cleanup', 'reattach', 'expand']);
});

test('restoreNativeExpando reattaches without expanding when the RES expando was not active', t => {
	const calls = [];

	restoreNativeExpando({
		expando: {
			open: false,
			expandWanted: false,
			destroy() { calls.push('destroy'); },
		},
		nativeExpando: {
			open: false,
			reattach() { calls.push('reattach'); },
			expand() { calls.push('expand'); },
		},
	});

	t.deepEqual(calls, ['destroy', 'reattach']);
});
