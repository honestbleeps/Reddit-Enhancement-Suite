/* @flow */

import { getUrlParams, insertParams, randomHash } from '../utils';
import { sendMessage } from 'browserEnvironment';

type AuthOptions = {
	domain: string,
	clientId: string,
	scope: string,
};

export function launchAuthFlow({ domain, clientId, scope }: AuthOptions) {
	const id = randomHash(16);

	const response = sendMessage('authFlow', { operation: 'start', id });

	const url = insertParams(domain, {
		client_id: clientId,
		scope,
		response_type: 'token',
		redirect_uri: 'https://www.reddit.com',
	});

	window.open(url, id, 'status=no,resizable=yes,toolbar=no,menubar=no,scrollbars=yes');

	return {
		response,
		cancel: () => sendMessage('authFlow', { operation: 'cancel', id }),
	};
}

(async () => {
	const params = getUrlParams(location.hash.replace('#', '?'));
	if (location.pathname === '/' && window.name && params.access_token) {
		const validId = await sendMessage('authFlow', { operation: 'complete', id: window.name, token: params.access_token });
		// check that we're actually waiting for a response, to prevent DoS
		if (validId) {
			window.close();
		}
	}
})();
