/* @flow */

import { getMessage } from '../../locales';
import { rawLocale } from '../utils/localization';

export function i18n(messageName: string, ...substitutions: string[]): string {
	if (!messageName) return '';
	// implementation should return the empty string if it cannot find a translation
	return getMessage(rawLocale(), messageName, substitutions) || messageName;
}
