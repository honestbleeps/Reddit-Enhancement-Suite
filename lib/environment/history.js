import { _sendMessage, isPrivateBrowsing } from './';

/**
 * Does nothing in private browsing mode.
 * @param {string} url
 * @returns {Promise<void, *>}
 */
export async function addURLToHistory(url) {
	if (await isPrivateBrowsing()) return;

	await _sendMessage('addURLToHistory', url);
}
