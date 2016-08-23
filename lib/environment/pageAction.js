import { addListener, sendMessage } from 'browserEnvironment';

const clickListeners = [];

export function onClick(callback) {
	clickListeners.push(callback);
}

addListener('pageActionClick', () => { for (const fn of clickListeners) fn(); });

const refreshListeners = [];

export function onRefresh(callback) {
	refreshListeners.push(callback);
}

addListener('pageActionRefresh', () => { for (const fn of refreshListeners) fn(); });

/**
 * @param {boolean} [state=false]
 * @returns {Promise<void, *>}
 */
export function show(state = false) {
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
