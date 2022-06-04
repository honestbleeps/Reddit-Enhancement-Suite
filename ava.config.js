/* @flow */

export default {
	files: [
		'**/__tests__/*.js',
		'!lib/modules/backupAndRestore/__tests__/serialization.js',
		// Ignore tests which breaks due to unsupported runtime
		'!lib/utils/__tests__/string.js',
		'!lib/utils/__tests__/async.js',
		'!lib/utils/__tests__/array.js',
		'!lib/utils/__tests__/location.js',
	],
	require: [
		'@babel/register',
		'esm',
	],
};
