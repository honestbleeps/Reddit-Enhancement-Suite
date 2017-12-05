/* @flow */

import { sendMessage } from './messaging';

export function get(key: string): Promise<any | void> {
	return sendMessage('session', ['get', key]);
}

export function set(key: string, value: mixed) {
	return sendMessage('session', ['set', key, value]);
}

export function delete_(key: string) {
	return sendMessage('session', ['delete', key]);
}
export { delete_ as delete };

export function has(key: string): Promise<boolean> {
	return sendMessage('session', ['has', key]);
}

export function clear() {
	return sendMessage('session', ['clear']);
}
