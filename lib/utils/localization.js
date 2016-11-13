import _ from 'lodash';
import moment from 'moment';

const redditLanguages = new Set(['en', 'ar', 'be', 'bg', 'bs', 'ca', 'cs', 'da', 'de', 'el', 'en-au', 'en-ca', 'en-gb', 'en-us', 'eo', 'es', 'es-ar', 'et', 'eu', 'fa', 'fi', 'fr', 'gd', 'he', 'hi', 'hr', 'hu', 'hy', 'id', 'is', 'it', 'ja', 'kn_IN', 'ko', 'la', 'lt', 'lv', 'nl', 'nn', 'no', 'pir', 'pl', 'pt', 'pt-pt', 'pt_BR', 'ro', 'ru', 'sk', 'sl', 'sr', 'sr-la', 'sv', 'ta', 'th', 'tr', 'uk', 'vi', 'zh']);

// some locales incorrectly use _ as a delimiter
export const locale = _.once(() => {
	const userLocale = (
		typeof document !== 'undefined' && redditLanguages.has(document.documentElement.getAttribute('lang')) && document.documentElement.getAttribute('lang') ||
		typeof navigator !== 'undefined' && navigator.language ||
		'en'
	).replace('_', '-');

	return isValidLocale(userLocale) ? userLocale : 'en';
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

export function formatNumber(number) {
	return number.toLocaleString(locale());
}

export function formatDate(date /* = now */) {
	return moment(date).locale(locale()).format('L');
}

export function formatDateTime(date /* = now */) {
	return moment(date).locale(locale()).format('L LTS');
}

export function formatDateDiff(from, to /* = now */) {
	return moment(to).locale(locale()).from(from, true);
}
