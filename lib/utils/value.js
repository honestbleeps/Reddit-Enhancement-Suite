/* @flow */

export function firstValid(...vals: unknown[]): unknown {
	return vals.find(val =>
		val !== undefined && val !== null && (typeof val !== 'number' || !isNaN(val)),
	);
}
