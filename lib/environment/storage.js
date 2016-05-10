import { sendMessage } from 'browserEnvironment';

/**
 * @param {string} key
 * @returns {Promise<*|null, *>}
 */
export function get(key) {
	return sendMessage('storage', ['get', key]);
}

/**
 * @param {string[]} keys
 * @returns {!Object<string, *|null>} A dictionary of stored values.
 */
export function batch(keys) {
	return sendMessage('storage', ['batch', keys]);
}

/**
 * @param {string} key
 * @param {*} [value]
 * @returns {Promise<void, *>}
 */
export function set(key, value) {
	return sendMessage('storage', ['set', key, value]);
}

/**
 * Deeply extends a value in storage.
 * @param {string} key
 * @param {!Object} value
 * @returns {Promise<void, *>}
 */
export function patch(key, value) {
	return sendMessage('storage', ['patch', key, value]);
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
	return sendMessage('storage', ['deletePath', key, path.join(',')]);
}

/**
 * @param {string} key
 * @returns {Promise<void, *>}
 */
function _delete(key) {
	return sendMessage('storage', ['delete', key]);
}
export { _delete as delete };

/**
 * @param {string} key
 * @returns {Promise<boolean, *>}
 */
export function has(key) {
	return sendMessage('storage', ['has', key]);
}

/**
 * @returns {Promise<string[], *>}
 */
export function keys() {
	return sendMessage('storage', ['keys']);
}

/**
 * @returns {Promise<void, *>}
 */
export function clear() {
	return sendMessage('storage', ['clear']);
}
