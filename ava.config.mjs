/* @flow */

export default {
	files: [
		'**/__tests__/*.js',
		// Ignore tests which breaks due to unsupported runtime
		'!lib/modules/backupAndRestore/__tests__/serialization.js',
		'!lib/utils/__tests__/string.js',
		'!lib/utils/__tests__/async.js',
		'!lib/utils/__tests__/array.js',
	],
	require: [
		'@babel/register',
	],
};
