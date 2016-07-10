import tinycolor from 'tinycolor2';

export function colorToArray(colorString) {
	const { r, g, b } = tinycolor(colorString).toRgb();
	return [r, g, b];
}

export function colorFromArray([r, g, b]) {
	return tinycolor({ r, g, b }).toHexString();
}
