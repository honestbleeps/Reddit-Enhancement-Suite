import moment from 'moment';

if (typeof navigator !== 'undefined') {
	moment.locale(navigator.language);
}

export function niceDate(date /* = now */) {
	return moment(date).format('L');
}

export function niceDateTime(date /* = now */) {
	return moment(date).format('L LTS');
}

export function niceDateDiff(from, to /* = now */) {
	return moment(to).from(from, true);
}
