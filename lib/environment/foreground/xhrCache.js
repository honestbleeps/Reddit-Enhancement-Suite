/* @flow */

import { sendMessage } from './messaging';

export function set(key: string, value: unknown): Promise<void> {
	return sendMessage('XHRCache', ['set', key, value]);
}

export function check(key: string, maxAge?: number /* milliseconds */): Promise<any | void> {
	return sendMessage('XHRCache', ['check', key, maxAge]);
}

function delete_(key: string): Promise<boolean> {
	return sendMessage('XHRCache', ['delete', key]);
}
export { delete_ as delete };

export function clear(): Promise<void> {
	return sendMessage('XHRCache', ['clear']);
}
