/* @flow */

import { sendMessage } from 'browserEnvironment';

export function deleteCookies(...cookieNames: string[]) {
	return sendMessage('deleteCookies', cookieNames.map(name => ({
		url: `${location.protocol}//${location.host}`,
		name,
	})));
}
