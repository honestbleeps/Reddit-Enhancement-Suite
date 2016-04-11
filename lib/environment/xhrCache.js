import { _sendMessage } from './_sendMessage';

/**
 * @param {string} key
 * @param {*} value
 * @returns {Promise<void, *>}
 */
export function set(key, value) {
	return _sendMessage('XHRCache', { operation: 'set', key, value });
}

/**
 * @param {string} key
 * @param {number} [maxAge] in milliseconds
 * @returns {Promise<*|void, *>}
 */
export function check(key, maxAge) {
	return _sendMessage('XHRCache', { operation: 'check', key, maxAge });
}

/**
 * @param {string} key
 * @returns {Promise<void, *>}
 */
export function _delete(key) {
	return _sendMessage('XHRCache', { operation: 'delete', key });
}
export { _delete as delete };

/**
 * @returns {Promise<void, *>}
 */
export function clear() {
	return _sendMessage('XHRCache', { operation: 'clear' });
}
