/* @flow */

import { sendSynchronous } from '../../browser';

export function getExtensionUrl(path: string): string {
	return sendSynchronous('getUrl', path);
}
