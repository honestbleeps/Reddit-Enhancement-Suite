/* @flow */

import { sendMessage } from './messaging';
import * as Permissions from './permissions';

export async function launchAuthFlow({
	domain,
	clientId,
	scope = '',
	permissions,
}: {|
	domain: string,
	clientId: string,
	scope?: string,
	permissions: Array<string>,
|}, warnUserInteraction: (message: string) => Promise<void>): Promise<string> {
	if (permissions.length && !await Permissions.has(permissions)) {
		const resAuth = 'https://redditenhancementsuite.com/oauth';
		// Firefox can use `launchWebAuthFlow` and doesn't need to redirect to our domain
		if (process.env.BUILD_TARGET !== 'firefox' && !await Permissions.has([resAuth])) {
			permissions.push(resAuth);
		}

		await warnUserInteraction(permissions.includes(resAuth) ? 'You may be redirected to redditenhancementsuite.com to complete the login process.' : '');

		await Permissions.request(permissions);
	}

	let responseUrl;
	try {
		responseUrl = await sendMessage('authFlow', { domain, clientId, scope, interactive: false });
	} catch (e) {
		console.error('Noninteractive auth failed:', e);

		responseUrl = await sendMessage('authFlow', { domain, clientId, scope, interactive: true });
	}

	const hash = new URL(responseUrl).hash.slice(1);
	const token = new URLSearchParams(hash).get('access_token');

	if (!token) throw new Error('No token found in response.');

	return token;
}
