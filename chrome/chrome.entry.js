/* @flow */

/* Chrome-specific polyfills */

// Chrome doesn't support objects (NYI) in URLSearchParams constructor
// https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams#Browser_compatibility
window.URLSearchParams = class URLSearchParams extends window.URLSearchParams {
	constructor(init) {
		if (typeof init === 'object' && !Array.isArray(init)) {
			init = Object.entries(init);
		}
		super(init);
	}
};
