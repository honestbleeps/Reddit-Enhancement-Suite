/* @flow */

import buildToken from 'exec-loader!../../../build/buildToken'; // eslint-disable-line import/no-extraneous-dependencies
import { CACHED_LANG_KEY, CACHED_MESSAGES_KEY, CACHED_MESSAGES_TOKEN_KEY } from '../../constants/localStorage';
import { sendMessage } from './messaging';

const REDDIT_LANGUAGES = new Set(['en', 'af', 'ar', 'be', 'bg', 'bn-IN', 'bn-bd', 'bs', 'ca', 'cs', 'cy', 'da', 'de', 'el', 'en-au', 'en-ca', 'en-gb', 'en-us', 'eo', 'es', 'es-ar', 'es-mx', 'et', 'eu', 'fa', 'fi', 'fil', 'fr', 'fr-ca', 'fy-NL', 'ga-ie', 'gd', 'gl', 'he', 'hi', 'hr', 'hu', 'hy', 'id', 'is', 'it', 'ja', 'kn_IN', 'ko', 'la', 'leet', 'lol', 'lt', 'lv', 'ms', 'mt-MT', 'nl', 'nn', 'no', 'pir', 'pl', 'pt', 'pt-pt', 'pt_BR', 'ro', 'ru', 'sk', 'sl', 'sr', 'sr-la', 'sv', 'ta', 'th', 'tr', 'uk', 'vi', 'zh', 'zh-cn']);
// reddit languages which are not valid browser languages
const SPECIAL_LANGUAGES = new Set(['leet', 'lol', 'pir']);

export let locale = navigator.language || 'en'; // May be changed depending on Reddit language

function isValidLocale(localeString) {
	// there doesn't appear to be a proper way to check if a language tag is valid, so we have to do this
	try {
		return typeof (0).toLocaleString(localeString) === 'string';
	} catch (e) {
		return false;
	}
}

function getRedditLocale() {
	const redditLocale = typeof document !== 'undefined' && document.documentElement.getAttribute('lang');
	if (redditLocale && (REDDIT_LANGUAGES.has(redditLocale))) {
		// `pt_BR` -> `pt-br`
		const locale = redditLocale.toLowerCase().replace('_', '-');
		if (isValidLocale(locale)) {
			requestIdleCallback(() => { sendMessage('setLastRedditLocale', locale); });
			return locale;
		}
	}

	return sendMessage('getLastRedditLocale');
}

let messages;

export async function _loadI18n(): Promise<void> {
	const redditLocale = await getRedditLocale();
	if (redditLocale && !SPECIAL_LANGUAGES.has(redditLocale)) locale = redditLocale;

	// fast path: i18n dictionary is cached
	// should be hit almost every time
	if (
		localStorage.getItem(CACHED_LANG_KEY) === redditLocale &&
		localStorage.getItem(CACHED_MESSAGES_TOKEN_KEY) === buildToken
	) {
		try {
			// eslint-disable-next-line require-atomic-updates
			messages = JSON.parse(localStorage.getItem(CACHED_MESSAGES_KEY) || '');
			return;
		} catch (e) {
			console.error('Failed to parse cached i18n', e);
		}
	}

	// slow path: wait for background page to send new locales
	// will be hit the first (ever) pageload on a new domain
	// or after clearing localStorage
	messages = await sendMessage('i18n', redditLocale);

	try { // Fails if remaining localStorage space is insufficient
		localStorage.setItem(CACHED_MESSAGES_KEY, JSON.stringify(messages));
		localStorage.setItem(CACHED_LANG_KEY, redditLocale);
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
