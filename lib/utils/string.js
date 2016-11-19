/* @flow */

import _ from 'lodash';
import { escapeHTML } from './html';
import type { Iteratee } from './array';

function stringTagFunction<T>(valueTransform: Iteratee<T, string | void>): (s: string[], ...values: T[]) => string {
	return (strings, ...values) =>
		_.zipWith(
			strings,
			values.map(valueTransform),
			(s, v) => `${s}${v === undefined ? '' : v}`
		).join('');
}

export const encode: (s: string[], ...values: string[]) => string = stringTagFunction(s => encodeURIComponent(s));

const _escapeHTML: (s: string[], ...values: string[]) => string = stringTagFunction(escapeHTML);
export { _escapeHTML as escapeHTML };
