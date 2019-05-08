/* @flow */

import _ from 'lodash';
import { locale } from '../environment';

// Avoid initializing dayjs before it's necessary
const Dayjs = _.once(() => {
	require('dayjs/locale/de'); // eslint-disable-line global-require
	require('dayjs/locale/el'); // eslint-disable-line global-require
	require('dayjs/locale/es'); // eslint-disable-line global-require
	require('dayjs/locale/he'); // eslint-disable-line global-require
	require('dayjs/locale/it'); // eslint-disable-line global-require
	require('dayjs/locale/nl'); // eslint-disable-line global-require
	require('dayjs/locale/pl'); // eslint-disable-line global-require
	require('dayjs/locale/pt-br'); // eslint-disable-line global-require
	require('dayjs/locale/pt'); // eslint-disable-line global-require
	const dayjs = require('dayjs'); // eslint-disable-line global-require
	dayjs.extend(require('dayjs/plugin/relativeTime')); // eslint-disable-line global-require
	dayjs.extend(require('dayjs/plugin/localizedFormat')); // eslint-disable-line global-require
	dayjs.locale(locale);
	return dayjs;
});

export const dayjs = (...args: any) => new Dayjs()(...args);

export function formatNumber(number: number): string {
	return number.toLocaleString(locale);
}

export function formatDate(date?: Date /* = now */): string {
	return dayjs(date).format('L');
}

export function formatDateTime(date?: Date /* = now */): string {
	return dayjs(date).format('L LTS');
}

export function formatDateDiff(from: Date, to?: Date /* = now */): string {
	return dayjs(to).from(from, true);
}

export function formatRelativeTime(from: Date): string {
	return dayjs(from).fromNow();
}
