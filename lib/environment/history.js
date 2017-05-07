/* @flow */

import { sendMessage } from '../../browser';
import { isPrivateBrowsing } from './';

export async function addURLToHistory(url: string): Promise<void> {
	if (await isPrivateBrowsing()) return;

	await sendMessage('addURLToHistory', url);
}

export function isURLVisited(url: string): Promise<boolean> {
	return sendMessage('isURLVisited', url);
}
