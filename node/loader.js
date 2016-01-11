/* eslint-env node */

import fs from 'fs';
import _eval from 'eval';
import requireNew  from 'require-new';

import _yargs from 'yargs';
const yargs = _yargs
	.count('verbose')
    .alias('v', 'verbose')
    .default('storage', 'andytuba-4.5.4')
	.default('assertstorage', 'andytuba-4.5.4-6dffad39')
	.default('ignorestorage', '_ignore-4.5.4-6dffad39')
	.argv;

import files from './files.json';
import equals from 'deep-equal';

const VERBOSE_LEVEL = yargs.verbose;
function WARN(...args)  { if (VERBOSE_LEVEL >= 0) console.log(...args); }
function INFO(...args)  { if (VERBOSE_LEVEL >= 1) console.log(...args); }
function DEBUG(...args) { if (VERBOSE_LEVEL >= 2) console.log(...args); }

/*
WARN("Showing only important stuff");
INFO("Showing semi-important stuff too");
DEBUG("Extra chatty mode");
*/

var storage = {};
if (yargs.storage) {
	storage = require('./storage/' + yargs.storage + '.json');
	INFO('Loaded storage from', yargs.storage, ' - loaded ', Object.getOwnPropertyNames(storage).length, 'items');
} else {
	INFO('Using empty storage');
}

var skipSections = [].concat(yargs.skip);
for (var section in files) {
	if (skipSections.indexOf(section) !== -1) continue;

	if (files[section].length) {
		files[section].forEach(function(filename) { importFile(filename); });
	} else if (typeof files[section] === 'object') {
		for (var key in files[section]) {
			if (!files[section].hasOwnProperty(key)) continue;
			importFile(files[section][key], key);
		}
	}
}
function importFile(filename, key) {
	filename = 'lib/' + filename;
	var contents = fs.readFileSync(filename, 'utf8');
	DEBUG('Loading', filename, key ? 'as ' + key : '');
	var exports = _eval(contents, filename, {}, true);
	if (key) {
		global[key] = exports;
	} else {
		for (const key in exports) {
			if (!exports.hasOwnProperty(key)) continue;
			global[key] = exports[key];
		}
	}
	var exported = Object.getOwnPropertyNames(exports).join(', ');
	if (exported) DEBUG('    -->', exported);
}

if (yargs.assertstorage) {
	var actual = RESStorage;
	var expected = requireNew('./storage/' + yargs.assertstorage + '.json');
	INFO('Loaded storage from', yargs.storage, ' - loaded ', Object.getOwnPropertyNames(storage).length, 'items');
	INFO('Asserting that storage matches', yargs.assertstorage, ' - loaded ', Object.getOwnPropertyNames(expected).length, 'items');

	var ignoredKeys = [];
	if (yargs.ignorestorage) {
		ignoredKeys = requireNew('./storage/' + yargs.ignorestorage+ '.json');
		INFO('ignoring keys listed in', yargs.ignorestorage, ' - ignoring ', Object.getOwnPropertyNames(ignoredKeys).length, 'items');
	}

	var failures = [];
	for (var key in expected) {
		if (ignoredKeys.indexOf(key) !== -1) {
			DEBUG('Skipping comparing key', key);
			continue;
		}
		DEBUG('Comparing key', key);
		let expectedValue = 0, actualValue = -1, error = false;
		if (key.indexOf('RESoptions.') === 0) {
			try {
				const expectedOptions = typeof expected[key] === 'string' && JSON.parse(expected[key]);
				const actualOptions = typeof actual[key] === 'string' && JSON.parse(actual[key]);
				for (var option in expectedOptions) {
					expectedValue = expectedOptions[option].value;
					actualValue = (actualOptions[option] || {}).value;
					error = !equals(expectedValue, actualValue);
					if (error) addError(key + '::' + option, error, expectedValue, actualValue);
				}
			} catch (e) {
				addError(key + '::' + option, error);
			}
		} else {
			expectedValue = expected[key];
			actualValue = actual[key];
			error = !equals(expectedValue, actualValue);
			if (error) addError(key, error, expectedValue, actualValue);
		}


	}
	if (failures.length) {
		WARN('[ERR] Encountered', failures.length, 'non-matching storage items');
		console.dir(failures);
	} else {
		INFO('Storage passed equality assertion');
	}
}

function addError(key, error, expected, actual) {
	if (!error) return;
	DEBUG(key, 'didn\'t match assert storage!', error);
	failures.push({
		error: typeof error === 'boolean' ? 'no match' : error,
		key: key,
		expected: JSON.stringify(expected),
		actual: JSON.stringify(actual)
	});
}

DEBUG('done');
process.exit();
