import { _addListener, _sendMessage } from './';
import { invokeAll } from '../utils';

const clickListeners = [];

export function addClickListener(callback) {
	clickListeners.push(callback);
}

_addListener('pageActionClick', () => clickListeners::invokeAll());

const refreshListeners = [];

export function addRefreshListener(callback) {
	refreshListeners.push(callback);
}

_addListener('pageActionRefresh', () => refreshListeners::invokeAll());

/**
 * @param {boolean} [state=false]
 * @returns {Promise<void, *>}
 */
export function show(state = false) {
	return _sendMessage('pageAction', { operation: 'show', state });
}

/**
 * @returns {Promise<void, *>}
 */
export function hide() {
	return _sendMessage('pageAction', { operation: 'hide' });
}

/**
 * @returns {Promise<void, *>}
 */
export function destroy() {
	return _sendMessage('pageAction', { operation: 'destroy' });
}
