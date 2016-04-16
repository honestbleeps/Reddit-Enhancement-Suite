import _ from 'lodash';

// some locales incorrectly use _ as a delimiter
const locale = _.once(() =>
	(
		typeof document !== 'undefined' && document.documentElement.getAttribute('lang') ||
		typeof navigator !== 'undefined' && navigator.language ||
		'en'
	).replace('_', '-')
);

export function commaDelimitedNumber(numStr) {
	const number = Number(String(numStr).replace(/[^\w]/, ''));
	try {
		return number.toLocaleString(locale());
	} catch (e) {
		return number.toLocaleString('en');
	}
}
