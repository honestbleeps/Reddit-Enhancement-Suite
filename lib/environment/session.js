import { sendMessage } from 'browserEnvironment';

/**
 * @param {string} key
 * @returns {Promise<*|void, *>}
 */
export function get(key) {
	return sendMessage('session', ['get', key]);
}

/**
 * @param {string} key
 * @param {*} value
 * @returns {Promise<void, *>}
 */
export function set(key, value) {
	return sendMessage('session', ['set', key, value]);
}

/**
 * @param {string} key
 * @returns {Promise<void, *>}
 */
export function _delete(key) {
	return sendMessage('session', ['delete', key]);
}
export { _delete as delete };

/**
 * @returns {Promise<void, *>}
 */
export function clear() {
	return sendMessage('session', ['clear']);
}
