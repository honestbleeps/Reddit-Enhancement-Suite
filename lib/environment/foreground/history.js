/* @flow */

import { sendMessage } from './messaging';
import { isPrivateBrowsing } from './privateBrowsing';

export async function addURLToHistory(url: string): Promise<void> {
	if (isPrivateBrowsing()) return;

	await sendMessage('addURLToHistory', url);
}

export function isURLVisited(url: string): Promise<boolean> {
	return sendMessage('isURLVisited', url);
}
