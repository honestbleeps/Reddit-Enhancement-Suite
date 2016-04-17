import { _sendMessage } from 'environment';

/**
 * @param {...string} cookieNames
 * @returns {Promise<void, *>}
 */
export function deleteCookies(...cookieNames) {
	return _sendMessage('deleteCookies', cookieNames.map(name => ({
		url: `${location.protocol}//${location.host}`,
		name
	})));
}
