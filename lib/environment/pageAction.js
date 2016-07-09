import { invokeAll } from '../utils';
import { addListener, sendMessage } from 'browserEnvironment';

const clickListeners = [];

export function onClick(callback) {
	clickListeners.push(callback);
}

addListener('pageActionClick', () => clickListeners::invokeAll());

const refreshListeners = [];

export function onRefresh(callback) {
	refreshListeners.push(callback);
}

addListener('pageActionRefresh', () => refreshListeners::invokeAll());

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
