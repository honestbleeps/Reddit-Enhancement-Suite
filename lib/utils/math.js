/**
 * Linearly interpolates a value within the interval [low, high].
 * @param {number} low  A number in (-Infinity, high)
 * @param {number} high A number in (low, Infinity)
 * @param {number} frac A number in [0, 1]
 * @returns {number} `value`
 */
export function interpolate(low, high, frac) {
	return (1 - frac) * low + frac * high;
}

/**
 * Given `low`, `high`, and `value`, returns `frac` such that `interpolate(low, high, frac) === value`.
 * @param {number} low   A number in [-Infinity, high)
 * @param {number} high  A number in (low, Infinity]
 * @param {number} value A number in [low, high]
 * @returns {number} `frac`
 */
export function deinterpolate(low, high, value) {
	if (low === -Infinity && high === Infinity) {
		return 0.5;
	} else if (low === -Infinity) {
		return 1;
	} else if (high === Infinity) {
		return 0;
	}
	return (value - low) / (high - low);
}

/**
 * Projects `value` from the interval [fromLow, fromHigh] into the interval [toLow, toHigh]
 * such that `deinterpolate(fromLow, fromHigh, value) === deinterpolate(toLow, toHigh, <return value>)`.
 * That is, `<return value>` and `value` are in the same position in their respective intervals.
 * `fromLow`, `fromHigh`, `toLow`, and `toHigh` must satisfy the bounds on `deinterpolate` and `interpolate`, respectively.
 * @param {number} fromLow
 * @param {number} fromHigh
 * @param {number} toLow
 * @param {number} toHigh
 * @param {number} value A number in [fromLow, fromHigh]
 * @returns {number}
 */
export function projectInto(fromLow, fromHigh, toLow, toHigh, value) {
	return interpolate(toLow, toHigh, deinterpolate(fromLow, fromHigh, value));
}

/*
 * @param {number} a   Dividend
 * @param {number} n   Divisor
 * @returns {number}   Positive reminder
 */
export function positiveModulo(a, n) {
	return ((a % n) + n) % n;
}
