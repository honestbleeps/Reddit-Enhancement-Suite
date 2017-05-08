/* @flow */

import { sendSynchronous } from '../../browser';

export function getExtensionId(): string {
	return sendSynchronous('extensionId');
}
