import { _sendMessage } from './_sendMessage';
import { isPrivateBrowsing } from './';

/**
 * Does nothing in private browsing mode.
 * @param {string} url
 * @returns {Promise<void, *>}
 */
export async function addURLToHistory(url) {
	if (process.env.BUILD_TARGET === 'safari') {
		// The iframe hack doesn't work anymore, so Safari has no way to add urls to history
		return;
	} else {
		if (await isPrivateBrowsing()) return;

		await _sendMessage('addURLToHistory', url);
	}
}
