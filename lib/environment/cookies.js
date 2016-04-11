import { _sendMessage } from './_sendMessage';

/**
 * @param {...string} cookieNames
 * @returns {Promise<void, *>}
 */
export function deleteCookies(...cookieNames) {
	if (process.env.BUILD_TARGET === 'safari') {
		for (const cookieName of cookieNames) {
			document.cookie = `${cookieName}=null;expires=${Date.now()}; path=/;domain=reddit.com`;
		}
		return Promise.resolve();
	} else {
		return _sendMessage('deleteCookies', cookieNames.map(name => ({
			url: `${location.protocol}//${location.host}`,
			name
		})));
	}
}
