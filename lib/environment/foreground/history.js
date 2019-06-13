/* @flow */

import { onceWhileUnresolved } from '../../utils/async';
import { sendMessage } from './messaging';
import { isPrivateBrowsing } from './privateBrowsing';
import * as Permissions from './permissions';

const getPermission = onceWhileUnresolved(() => Permissions.request(['history']));

export async function addURLToHistory(url: string): Promise<void> {
	if (isPrivateBrowsing()) return;
	await getPermission();
	await sendMessage('addURLToHistory', url);
}

export async function isURLVisited(url: string): Promise<boolean> {
	await getPermission();
	return sendMessage('isURLVisited', url);
}
