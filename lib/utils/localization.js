/* @flow */

import moment from 'moment';
import { locale } from '../environment';

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

export function formatRelativeTime(from: Date): string {
	return moment(from).locale(locale()).fromNow();
}
