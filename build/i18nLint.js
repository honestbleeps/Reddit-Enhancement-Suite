/* @noflow */

/* eslint-disable import/no-commonjs, import/no-nodejs-modules */

// Checks that all keys listed in locales/locales/en.json are used somewhere in lib/**/*.js.
// Keys must be used verbatim, that is, literally 'thisKey', and not 'this' + 'Key'.
// This is required not only for this script, but also so that developers can always grep for usages of an i18n key.

const { join } = require('path');
const { readFileSync, readdirSync, statSync } = require('fs');
const i18n = require('../locales/locales/en.json');

function checkUnused() {
	let allFiles = '';

	(function readDir(pathname) {
		for (const filename of readdirSync(pathname)) {
			const filePath = join(pathname, filename);
			const stats = statSync(filePath);
			if (stats.isDirectory()) {
				readDir(filePath);
			} else if (filename.endsWith('.js')) {
				allFiles += readFileSync(filePath);
			}
		}
	})(join(__dirname, '..', 'lib'));

	const allKeys = Object.keys(i18n);
	const unusedKeys = allKeys.filter(key => !allFiles.includes(`'${key}'`));

	if (unusedKeys.length > 0) {
		process.exitCode = 1;
		console.error('ERROR: The following i18n keys were not used in src/**/*.js:');
		for (const key of unusedKeys) {
			console.error(`\t'${key}'`);
		}
		console.error('To fix this, either use them or remove them from locales/locales/en.json.');
		console.error('Note: Keys must be used verbatim. They cannot be dynamically generated.');
	} else {
		console.log(`Success! All ${allKeys.length} i18n keys were used.`);
	}
}

checkUnused();
