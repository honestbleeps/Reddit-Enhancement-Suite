/* @flow */

import { sendMessage } from '../../browser';
import { CACHED_GOOGLE_EMAIL_ADDRESS } from '../constants/localStorage';
import { Permissions } from './';

export async function launchAuthFlow(
	{ domain, clientId, scope = '', loginHint = '' }: {| domain: string, clientId: string, scope?: string, loginHint?: string |},
	warnUserInteraction: (message: string) => Promise<void>,
): Promise<string> {
	let responseUrl;
	try {
		responseUrl = await sendMessage('authFlow', { domain, clientId, scope, loginHint, interactive: false });
	} catch (e) {
		console.error('Noninteractive auth failed:', e);

		// Invalidate google email address
		if (domain === 'https://accounts.google.com/o/oauth2/v2/auth' && loginHint) {
			localStorage.removeItem(CACHED_GOOGLE_EMAIL_ADDRESS);
		}

		await warnUserInteraction('You may be redirected to redditenhancementsuite.com to complete the login process.');

		await Permissions.request(['https://redditenhancementsuite.com/oauth']);

		responseUrl = await sendMessage('authFlow', { domain, clientId, scope, loginHint, interactive: true });
	}

	const hash = new URL(responseUrl).hash.slice(1);
	const token = new URLSearchParams(hash).get('access_token');

	if (!token) throw new Error('No token found in response.');

	return token;
}
