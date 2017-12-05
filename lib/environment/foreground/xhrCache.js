/* @flow */

import { sendMessage } from './messaging';

export function set(key: string, value: mixed) {
	return sendMessage('XHRCache', ['set', key, value]);
}

export function check(key: string, maxAge?: number /* milliseconds */): Promise<any | void> {
	return sendMessage('XHRCache', ['check', key, maxAge]);
}

function delete_(key: string) {
	return sendMessage('XHRCache', ['delete', key]);
}
export { delete_ as delete };

export function clear() {
	return sendMessage('XHRCache', ['clear']);
}
