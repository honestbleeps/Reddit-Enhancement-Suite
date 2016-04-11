import { _sendMessage } from './_sendMessage';

/**
 * @param {string} key
 * @returns {Promise<*|void, *>}
 */
export function get(key) {
	return _sendMessage('session', ['get', key]);
}

/**
 * @param {string} key
 * @param {*} value
 * @returns {Promise<void, *>}
 */
export function set(key, value) {
	return _sendMessage('session', ['set', key, value]);
}

/**
 * @param {string} key
 * @returns {Promise<void, *>}
 */
export function _delete(key) {
	return _sendMessage('session', ['delete', key]);
}
export { _delete as delete };

/**
 * @returns {Promise<void, *>}
 */
export function clear() {
	return _sendMessage('session', ['clear']);
}
