/* @flow */

import { addListener, sendMessage } from './messaging';

const clickListeners = [];

export function onClick(callback: () => void) {
	clickListeners.push(callback);
}

addListener('pageActionClick', () => { for (const fn of clickListeners) fn(); });

export function show(state?: boolean = false) {
	return sendMessage('pageAction', { operation: 'show', state });
}

export function hide() {
	return sendMessage('pageAction', { operation: 'hide' });
}
