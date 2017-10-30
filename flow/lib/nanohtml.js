/* @flow */

declare module 'nanohtml' {
	// Flow (currently) only checks return values of string tag functions
	// so typing `values` does nothing right now
	declare module.exports: (strings: string[], ...values: Array<null | string | number | HTMLElement>) => HTMLElement;
}
