/* @flow */

import { sendMessage } from '../../browser';

export function set(key: string, value: mixed) {
	return sendMessage('XHRCache', ['set', key, value]);
}

export function check(key: string, maxAge?: number /* milliseconds */): Promise<any | void> {
	return sendMessage('XHRCache', ['check', key, maxAge]);
}

export function _delete(key: string) {
	return sendMessage('XHRCache', ['delete', key]);
}
export { _delete as delete };

export function clear() {
	return sendMessage('XHRCache', ['clear']);
}
