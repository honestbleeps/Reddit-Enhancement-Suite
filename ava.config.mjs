/* @flow */

export default {
	files: [
		'build/__tests__/*.js',
		// `lib` must be transpiled before tests are executed
		'dist/transpiled/**/__tests__/*.js',
	],
};
