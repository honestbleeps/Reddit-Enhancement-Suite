/* @noflow (don't try to resolve the `require`) */

// to work around the fact that webpack is absolutely rabid about
// replacing `require` with `__webpack_require__`, even through aliasing
export function nativeRequire(path) {
	return require(path); // eslint-disable-line global-require
}
