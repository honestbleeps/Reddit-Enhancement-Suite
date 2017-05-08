/* @flow */

import { sendSynchronous } from '../../browser';

export function isPrivateBrowsing(): boolean {
	return sendSynchronous('isPrivateBrowsing');
}
