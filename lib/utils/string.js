/* @flow */

import _ from 'lodash';
import { flow } from 'lodash/fp';
import { downcast } from './flow';
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

type OpaqueSafeString = {| __safe__: string |};

export function safe(str: string): OpaqueSafeString {
	return { __safe__: str };
}

const htmlTagFunction: StringTagFunction<?false | string | number | OpaqueSafeString | OpaqueSafeString[], string> = stringTagFunction(x => {
	// avoid treating 0 as falsy and rendering nothing
	if (typeof x === 'number') return String(x);
	// falsy values not rendered
	if (!x) return '';
	// bare strings/numbers are escaped
	if (typeof x === 'string') return escapeHTML(x);
	// arrays of safe strings
	if (Array.isArray(x)) return x.map(s => s.__safe__).join('');
	// safe strings
	if ('__safe__' in x) return x.__safe__;
	throw new TypeError(`Invalid html template interpolation: ${String(x)}`);
});

/**
 * Intended for mustache-like HTML templates:
 * - falsy values are not rendered
 * - arrays are joined with the empty string
 * - strings are html-escaped, single element string tuples are not
 */
export const html = flow(
	htmlTagFunction,
	markup => {
		// <template> elements allow out-of-place elements e.g. <tr> without a <table>
		// but they cause weird issues in Firefox (#4222), and it's unlikely that you'll need
		// to use <tr>, except embedded in another template with string._html`<tr>...</tr>`,
		// which doesn't have this limitation.
		const template = document.createElement('div');
		template.innerHTML = markup;
		if (template.childElementCount !== 1) {
			throw new Error(`Html template should have exactly one root node, but had ${template.childElementCount}`);
		}
		const child = downcast(template.firstElementChild, HTMLElement);
		child.remove();
		return child;
	}
);

/**
 * Intended for nested arrays or optional values in HTML templates.
 */
export const _html = flow(
	htmlTagFunction,
	safe
);
