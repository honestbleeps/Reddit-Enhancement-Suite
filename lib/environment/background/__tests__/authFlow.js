/* @flow */

import test from 'ava';

import { generateState, isExpectedRedirect, validateAuthResponse } from '../authFlow.js';

const redirectUri = 'https://redditenhancementsuite.com/oauth';

test('generateState creates random 256-bit hex values', t => {
	const first = generateState();
	const second = generateState();

	t.regex(first, /^[0-9a-f]{64}$/);
	t.not(first, second);
});

test('isExpectedRedirect requires the exact redirect origin and path', t => {
	t.true(isExpectedRedirect(`${redirectUri}#access_token=token`, redirectUri));
	t.false(isExpectedRedirect(`${redirectUri}/other#access_token=token`, redirectUri));
	t.false(isExpectedRedirect('https://redditenhancementsuite.com.evil.example/oauth#access_token=token', redirectUri));
});

test('validateAuthResponse accepts a matching state', t => {
	const responseUrl = `${redirectUri}#access_token=token&state=expected`;
	t.is(validateAuthResponse(responseUrl, redirectUri, 'expected'), responseUrl);
});

test('validateAuthResponse rejects missing or mismatched state', t => {
	t.throws(
		() => validateAuthResponse(`${redirectUri}#access_token=token`, redirectUri, 'expected'),
		{ message: 'Authorization response state did not match.' },
	);
	t.throws(
		() => validateAuthResponse(`${redirectUri}#access_token=token&state=other`, redirectUri, 'expected'),
		{ message: 'Authorization response state did not match.' },
	);
});
