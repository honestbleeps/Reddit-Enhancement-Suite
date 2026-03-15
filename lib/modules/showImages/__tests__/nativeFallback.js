/* @flow */

import test from 'ava';
import { shouldPreferNativeExpando } from '../nativeFallback.js';

test('shouldPreferNativeExpando only prefers native vreddit expandos on Safari', t => {
	t.true(shouldPreferNativeExpando('vreddit', true, 'safari'));
	t.false(shouldPreferNativeExpando('vreddit', false, 'safari'));
	t.false(shouldPreferNativeExpando('imgur', true, 'safari'));
});

test('shouldPreferNativeExpando stays disabled outside Safari', t => {
	t.false(shouldPreferNativeExpando('vreddit', true, 'chrome'));
});
