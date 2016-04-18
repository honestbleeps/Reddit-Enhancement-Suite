export const MINUTE = 1000 * 60;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export const now = (typeof performance !== 'undefined' && performance.now) ?
	() => performance.now() :
	() => Date.now();
