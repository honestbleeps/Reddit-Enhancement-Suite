/* @flow */

import { addListener, sendMessage } from 'browserEnvironment';

const clickListeners = [];

export function onClick(callback: () => void) {
	clickListeners.push(callback);
}

addListener('pageActionClick', () => { for (const fn of clickListeners) fn(); });

const refreshListeners = [];

export function onRefresh(callback: () => void) {
	refreshListeners.push(callback);
}

addListener('pageActionRefresh', () => { for (const fn of refreshListeners) fn(); });

export function show(state?: boolean = false) {
	return sendMessage('pageAction', { operation: 'show', state });
}

/**
 * @returns {Promise<void, *>}
 */
export function hide() {
	return sendMessage('pageAction', { operation: 'hide' });
}

/**
 * @returns {Promise<void, *>}
 */
export function destroy() {
	return sendMessage('pageAction', { operation: 'destroy' });
}
