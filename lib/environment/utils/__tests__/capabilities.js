/* @flow */

import test from 'ava';

import {
	getBrowserCapabilities,
	shouldUseBackgroundRedirectAuth,
	shouldUseControlledDownloads,
	shouldUseExtensionHistory,
} from '../capabilities.js';

test('Safari capability fallbacks', t => {
	const safari = getBrowserCapabilities('safari');

	t.false(safari.isFirefox);
	t.true(safari.isSafari);
	t.true(safari.supportsActionClickBootstrap);
	t.false(shouldUseBackgroundRedirectAuth(safari));
	t.false(shouldUseControlledDownloads(safari));
	t.false(shouldUseExtensionHistory(false, safari));
});

test('Firefox capability flags', t => {
	const firefox = getBrowserCapabilities('firefox');

	t.true(firefox.isFirefox);
	t.false(firefox.isSafari);
	t.false(firefox.supportsActionClickBootstrap);
	t.true(firefox.supportsHistory);
	t.true(firefox.supportsControlledDownloads);
	t.false(firefox.shouldBatchOptionStorage);
});

test('History is disabled in private browsing even when supported', t => {
	const chrome = getBrowserCapabilities('chrome');

	t.true(shouldUseExtensionHistory(false, chrome));
	t.false(shouldUseExtensionHistory(true, chrome));
});
