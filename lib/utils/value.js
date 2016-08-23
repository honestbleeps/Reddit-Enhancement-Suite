/* @flow */

export function firstValid(...vals: mixed[]): mixed {
	return vals.find(val =>
		val !== undefined && val !== null && (typeof val !== 'number' || !isNaN(val))
	);
}
