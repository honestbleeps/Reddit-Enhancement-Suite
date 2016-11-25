/* @flow */

export const MINUTE = 1000 * 60;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;

// `performance` may be null on Firefox
// so `typeof performance !== 'undefined'` is not sufficient
export const now: () => number = (window.performance && performance.now) ?
	() => performance.now() :
	() => Date.now();
