/* @flow */

import { sendMessage } from 'browserEnvironment';

export function get(key: string): Promise<any | null> {
	return sendMessage('storage', ['get', key]);
}

export function batch<T: string>(keys: T[]): Promise<{ [key: T]: any | null }> {
	return sendMessage('storage', ['batch', keys]);
}

export function set(key: string, value: mixed) {
	return sendMessage('storage', ['set', key, value]);
}

/*
 * Deeply extends a value in storage.
 */
export function patch(key: string, value: { [key: string]: mixed }) {
	return sendMessage('storage', ['patch', key, value]);
}

/*
 * Deletes a property on a value in storage.
 * Path components may not contain ','
 * i.e. `deletePath('userTaggerStorageKey', 'username', 'tag')`
 * will `delete userTaggerStoredValue.username.tag`
 */
export function deletePath(key: string, ...path: string[]) {
	return sendMessage('storage', ['deletePath', key, path.join(',')]);
}

function _delete(key: string) {
	return sendMessage('storage', ['delete', key]);
}
export { _delete as delete };

export function has(key: string): Promise<boolean> {
	return sendMessage('storage', ['has', key]);
}

export function keys(): Promise<string[]> {
	return sendMessage('storage', ['keys']);
}

export function clear() {
	return sendMessage('storage', ['clear']);
}
