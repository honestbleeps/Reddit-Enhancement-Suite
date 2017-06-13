/* @flow */

import { sendMessage } from '../../browser';
import { Permissions } from './';

export async function launchAuthFlow(
	{ domain, clientId, scope = '' }: {| domain: string, clientId: string, scope?: string |},
	warnUserInteraction: (message: string) => Promise<void>,
): Promise<string> {
	let responseUrl;
	try {
		responseUrl = await sendMessage('authFlow', { domain, clientId, scope, interactive: false });
	} catch (e) {
		console.error('Noninteractive auth failed:', e);

		await warnUserInteraction('You may be redirected to redditenhancementsuite.com to complete the login process.');

		await Permissions.request(['https://redditenhancementsuite.com/oauth']);

		responseUrl = await sendMessage('authFlow', { domain, clientId, scope, interactive: true });
	}

	const hash = new URL(responseUrl).hash.slice(1);
	const token = new URLSearchParams(hash).get('access_token');

	if (!token) throw new Error('No token found in response.');

	return token;
}
