/* @flow */

import _ from 'lodash';
import levenshtein from 'fast-levenshtein';
import { escapeHTML } from './html';
import type { Iteratee } from './array';

type StringTagFunction<V, Out> = (s: string[], ...values: V[]) => Out;

function stringTagFunction<T>(valueTransform: Iteratee<T, string | void>): StringTagFunction<T, string> {
	return (strings, ...values) =>
		_.zipWith(
			strings,
			values.map(valueTransform),
			(s, v) => `${s}${v === undefined ? '' : v}`
		).join('');
}

export const encode: StringTagFunction<string, string> = stringTagFunction(encodeURIComponent);

export const escape: StringTagFunction<string, string> = stringTagFunction(escapeHTML);

const MAX_DISTANCE_RATIO = 0.05;

export function areSimilar(a: string, b: string): boolean {
	return levenshtein.get(a, b) <= MAX_DISTANCE_RATIO * Math.max(a.length, b.length);
}
