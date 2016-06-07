import { sendMessage } from 'browserEnvironment';

/**
 * @param {string} key
 * @param {*} value
 * @returns {Promise<void, *>}
 */
export function set(key, value) {
	return sendMessage('XHRCache', ['set', key, value]);
}

/**
 * @param {string} key
 * @param {number} [maxAge] in milliseconds
 * @returns {Promise<*|void, *>}
 */
export function check(key, maxAge) {
	return sendMessage('XHRCache', ['check', key, maxAge]);
}

/**
 * @param {string} key
 * @returns {Promise<void, *>}
 */
export function _delete(key) {
	return sendMessage('XHRCache', ['delete', key]);
}
export { _delete as delete };

/**
 * @returns {Promise<void, *>}
 */
export function clear() {
	return sendMessage('XHRCache', ['clear']);
}
