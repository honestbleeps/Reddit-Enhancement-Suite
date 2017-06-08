/* @flow */

import { sendMessage } from '../../browser';

export async function launchAuthFlow(
	{ domain, clientId, scope, redirectUri = 'https://redditenhancementsuite.com/oauth' }: {| domain: string, clientId: string, scope: string, redirectUri?: string |},
	warnUserInteraction: (message: string) => Promise<void>,
): Promise<string> {
	let responseUrl;
	try {
		responseUrl = await sendMessage('authFlow', { domain, clientId, scope, redirectUri, interactive: false });
	} catch (e) {
		console.error('Noninteractive auth failed:', e);

		await warnUserInteraction(`You may be redirected to ${process.env.BUILD_TARGET === 'chrome' ?
			'chromiumapp.org (Google\'s special domain for Chrome extensions)' :
			new URL(redirectUri).hostname
		} to complete the login process.`);

		responseUrl = await sendMessage('authFlow', { domain, clientId, scope, redirectUri, interactive: true });
	}

	const hash = new URL(responseUrl).hash.slice(1);
	const token = new URLSearchParams(hash).get('access_token');

	if (!token) throw new Error('No token found in response.');

	return token;
}
