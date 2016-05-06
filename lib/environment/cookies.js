import { sendMessage } from 'browserEnvironment';

/**
 * @param {...string} cookieNames
 * @returns {Promise<void, *>}
 */
export function deleteCookies(...cookieNames) {
	return sendMessage('deleteCookies', cookieNames.map(name => ({
		url: `${location.protocol}//${location.host}`,
		name,
	})));
}
