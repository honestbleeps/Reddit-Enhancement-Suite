/* @flow */

import { shouldUseExtensionHistory, supportsHistory } from '../utils/capabilities';
import { sendMessage } from './messaging';
import { isPrivateBrowsing } from './privateBrowsing';

export async function addURLToHistory(url: string): Promise<void> {
	if (!shouldUseExtensionHistory(isPrivateBrowsing())) return;

	await sendMessage('addURLToHistory', url);
}

export function isURLVisited(url: string): Promise<boolean> {
	if (!supportsHistory) return Promise.resolve(false);
	return sendMessage('isURLVisited', url);
}
