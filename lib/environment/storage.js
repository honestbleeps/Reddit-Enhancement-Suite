import { _sendMessage } from './';

/**
 * @param {string} key
 * @returns {Promise<*|null, *>}
 */
export function get(key) {
	return _sendMessage('storage', ['get', key]);
}

/**
 * @param {string} key
 * @param {*} [value]
 * @returns {Promise<void, *>}
 */
export function set(key, value) {
	return _sendMessage('storage', ['set', key, value]);
}

/**
 * Deeply extends a value in storage.
 * @param {string} key
 * @param {!Object} value
 * @returns {Promise<void, *>}
 */
export function patch(key, value) {
	return _sendMessage('storage', ['patch', key, value]);
}

/**
 * Deletes a property on a value in storage.
 * Path components may not contain ','
 * i.e. `deletePath('userTaggerStorageKey', 'username', 'tag')`
 * will `delete userTaggerStoredValue.username.tag`
 * @param {string} key
 * @param {...string} path
 * @returns {Promise<void, *>}
 */
export function deletePath(key, ...path) {
	return _sendMessage('storage', ['deletePath', key, path.join(',')]);
}

/**
 * @param {string} key
 * @returns {Promise<void, *>}
 */
function _delete(key) {
	return _sendMessage('storage', ['delete', key]);
}
export { _delete as delete };

/**
 * @param {string} key
 * @returns {Promise<boolean, *>}
 */
export function has(key) {
	return _sendMessage('storage', ['has', key]);
}

/**
 * @returns {Promise<string[], *>}
 */
export function keys() {
	return _sendMessage('storage', ['keys']);
}

/**
 * @returns {Promise<void, *>}
 */
export function clear() {
	return _sendMessage('storage', ['clear']);
}
