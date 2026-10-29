/* @flow */

import { sendMessage } from './messaging';

export function get(key: string): Promise<any | void> {
	return sendMessage('session', ['get', key]);
}

export function set(key: string, value: unknown): Promise<void> {
	return sendMessage('session', ['set', key, value]);
}

export function delete_(key: string): Promise<boolean> {
	return sendMessage('session', ['delete', key]);
}
export { delete_ as delete };

export function has(key: string): Promise<boolean> {
	return sendMessage('session', ['has', key]);
}

export function clear(): Promise<void> {
	return sendMessage('session', ['clear']);
}
