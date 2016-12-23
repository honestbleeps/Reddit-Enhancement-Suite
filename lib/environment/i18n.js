/* @flow */

import { sendSynchronous } from 'browserEnvironment';

export function _loadLocales(userLocale: string): void | Promise<void> {
	return sendSynchronous('i18n-load', userLocale);
}

export function i18n(messageName: string, ...substitutions: Array<string | number>): string {
	if (!messageName) return '';
	// implementation should return the empty string if it cannot find a translation
	return sendSynchronous('i18n', [messageName, substitutions]) || messageName;
}
