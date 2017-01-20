/* @flow */

import tinycolor from 'tinycolor2';

type ColorTuple = [number, number, number];

export function colorToArray(colorString: string): ColorTuple {
	const { r, g, b } = tinycolor(colorString).toRgb();
	return [r, g, b];
}

export function colorFromArray([r, g, b]: ColorTuple): string {
	return tinycolor({ r, g, b }).toHexString();
}
