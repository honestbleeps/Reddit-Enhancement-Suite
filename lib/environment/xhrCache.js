/* @flow */

import { sendMessage } from '../../browser';

export function set(key: string, value: string) {
	return sendMessage('XHRCache', ['set', key, value]);
}

export function check(key: string, maxAge?: number /* milliseconds */): Promise<string | void> {
	return sendMessage('XHRCache', ['check', key, maxAge]);
}

function _delete(key: string) {
	return sendMessage('XHRCache', ['delete', key]);
}
export { _delete as delete };

export function clear() {
	return sendMessage('XHRCache', ['clear']);
}
