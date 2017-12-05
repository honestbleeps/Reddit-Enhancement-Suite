/* @flow */

import buildToken from 'exec-loader!../../../build/buildToken';
import { CACHED_LANG_KEY, CACHED_MESSAGES_KEY, CACHED_MESSAGES_TOKEN_KEY } from '../../constants/localStorage';
import { rawLocale } from '../../utils/localization';
import { sendMessage } from './messaging';

let messages;

export async function _loadI18n(): Promise<void> {
	// fast path: i18n dictionary is cached
	// should be hit almost every time
	if (
		localStorage.getItem(CACHED_LANG_KEY) === rawLocale() &&
		localStorage.getItem(CACHED_MESSAGES_TOKEN_KEY) === buildToken
	) {
		try {
			messages = JSON.parse(localStorage.getItem(CACHED_MESSAGES_KEY) || '');
			return;
		} catch (e) {
			console.error('Failed to parse cached i18n', e);
		}
	}

	// slow path: wait for background page to send new locales
	// will be hit the first (ever) pageload on a new domain
	// or after clearing localStorage
	messages = await sendMessage('i18n', rawLocale());

	try { // Fails if remaining localStorage space is insufficient
		localStorage.setItem(CACHED_MESSAGES_KEY, JSON.stringify(messages));
		localStorage.setItem(CACHED_LANG_KEY, rawLocale());
		localStorage.setItem(CACHED_MESSAGES_TOKEN_KEY, buildToken);
	} catch (e) {
		console.error('Could not cache i18n - RES will load VERY slowly', e);
		// XXX: reddit has a habit of filling up these localstorage keys, so speculatively delete them
		localStorage.removeItem('ads.adserverDownvotePixel');
		localStorage.removeItem('ads.adserverUpvotePixel');
	}
}

// Behaves like https://developer.chrome.com/extensions/i18n#method-getMessage
export function i18n(messageName: string, ...substitutions: Array<string | number>): string {
	if (!messageName) return '';

	if (!messages) {
		if (process.env.NODE_ENV === 'development') {
			throw new Error(`i18n called too early! key: ${messageName}`);
		} else {
			console.error('i18n called too early! key:', messageName);
			return messageName;
		}
	}

	const message = messages[messageName];

	if (!message) return messageName;

	// Fast path: avoid running regex when there are no substitutions
	if (substitutions.length === 0) return message;

	// Replace direct references to substitutions, e.g. `First substitution: $1`
	// Maximum of 9 substitutions allowed, i.e. only one number after the `$`
	return message.replace(/\$(\d)\b(?!\$)/g, (match, number) => substitutions[number - 1]);

	// Chrome also supports named placeholders, e.g. `Error: $error_message$`
	// but Transifex does not create the `placeholders` field in exported JSON
	// https://developer.chrome.com/extensions/i18n#examples-getMessage
}
