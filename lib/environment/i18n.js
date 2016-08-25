/* @flow */

import { sendSynchronous } from 'browserEnvironment';

export function i18n(messageName: string, ...substitutions: string[]): string {
	if (!messageName) return '';
	// implementation should return the empty string if it cannot find a translation
	return sendSynchronous('i18n', [messageName, substitutions]) || messageName;
}
