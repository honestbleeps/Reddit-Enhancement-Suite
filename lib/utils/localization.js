/* @flow */

import _ from 'lodash';
import moment from 'moment';

const DEFAULT_LOCALE = 'en';
const REDDIT_LANGUAGES = new Set(['en', 'af', 'ar', 'be', 'bg', 'bn-IN', 'bn-bd', 'bs', 'ca', 'cs', 'cy', 'da', 'de', 'el', 'en-au', 'en-ca', 'en-gb', 'en-us', 'eo', 'es', 'es-ar', 'es-mx', 'et', 'eu', 'fa', 'fi', 'fil', 'fr', 'fr-ca', 'fy-NL', 'ga-ie', 'gd', 'gl', 'he', 'hi', 'hr', 'hu', 'hy', 'id', 'is', 'it', 'ja', 'kn_IN', 'ko', 'la', 'leet', 'lol', 'lt', 'lv', 'ms', 'mt-MT', 'nl', 'nn', 'no', 'pir', 'pl', 'pt', 'pt-pt', 'pt_BR', 'ro', 'ru', 'sk', 'sl', 'sr', 'sr-la', 'sv', 'ta', 'th', 'tr', 'uk', 'vi', 'zh', 'zh-cn']);
// reddit languages which are not valid browser languages
const SPECIAL_LANGUAGES = new Set(['leet', 'lol', 'pir']);

// deliberately not exported through utils/index.js
// not suitable for consumption by module code (not normalized)
export const rawLocale = _.once((): string => {
	const redditLocale = typeof document !== 'undefined' && document.documentElement.getAttribute('lang');

	if (redditLocale && REDDIT_LANGUAGES.has(redditLocale)) {
		return redditLocale;
	} else {
		// on np. or some non-language subdomain
		return navigator.language || DEFAULT_LOCALE;
	}
});

const locale = _.once(() => {
	if (!SPECIAL_LANGUAGES.has(rawLocale())) {
		// `pt_BR` -> `pt-br`
		const locale = rawLocale().toLowerCase().replace('_', '-');
		return isValidLocale(locale) ? locale : DEFAULT_LOCALE;
	} else {
		return DEFAULT_LOCALE;
	}
});

function isValidLocale(localeString) {
	// there doesn't appear to be a proper way to check if a language tag is valid, so we have to do this
	try {
		(0).toLocaleString(localeString);
	} catch (e) {
		return false;
	}
	return true;
}

export function formatNumber(number: number): string {
	return number.toLocaleString(locale());
}

export function formatDate(date?: Date /* = now */): string {
	return moment(date).locale(locale()).format('L');
}

export function formatDateTime(date?: Date /* = now */): string {
	return moment(date).locale(locale()).format('L LTS');
}

export function formatDateDiff(from: Date, to?: Date /* = now */): string {
	return moment(to).locale(locale()).from(from, true);
}
