/* @flow */

import { isPrivateBrowsing } from './';
import { sendMessage } from 'browserEnvironment';

export async function addURLToHistory(url: string): Promise<void> {
	if (await isPrivateBrowsing()) return;

	await sendMessage('addURLToHistory', url);
}

export function isURLVisited(url: string): Promise<boolean> {
	return sendMessage('isURLVisited', url);
}
