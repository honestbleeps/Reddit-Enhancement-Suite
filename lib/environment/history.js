import { isPrivateBrowsing } from './';
import { sendMessage } from 'browserEnvironment';

/**
 * Does nothing in private browsing mode.
 * @param {string} url
 * @returns {Promise<void, *>}
 */
export async function addURLToHistory(url) {
	if (await isPrivateBrowsing()) return;

	await sendMessage('addURLToHistory', url);
}
