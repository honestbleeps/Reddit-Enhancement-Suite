import _ from 'lodash';
import moment from 'moment';

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

export function niceDate(date /* = now */) {
	return moment(date).locale(locale()).format('L');
}

export function niceDateTime(date /* = now */) {
	return moment(date).locale(locale()).format('L LTS');
}

export function niceDateDiff(from, to /* = now */) {
	return moment(to).locale(locale()).from(from, true);
}
