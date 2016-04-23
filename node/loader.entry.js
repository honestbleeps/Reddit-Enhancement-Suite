import './mocks';

import { Init } from '../lib/core';
import { _mockStorage } from './environment';
import { nativeRequire } from '../lib/environment/_nativeRequire';

const _yargs = nativeRequire('yargs');
const equals = nativeRequire('deep-equal');

const yargs = _yargs
	.count('verbose')
    .alias('v', 'verbose')
    .default('storage', 'andytuba-4.5.4')
	.default('assertstorage', 'andytuba-4.5.4-6dffad39')
	.default('ignorestorage', '_ignore-4.5.4-6dffad39')
	.argv;

const VERBOSE_LEVEL = yargs.verbose;
function WARN(...args) { if (VERBOSE_LEVEL >= 0) console.log(...args); }
function INFO(...args) { if (VERBOSE_LEVEL >= 1) console.log(...args); }
function DEBUG(...args) { if (VERBOSE_LEVEL >= 2) console.log(...args); }

/*
WARN("Showing only important stuff");
INFO("Showing semi-important stuff too");
DEBUG("Extra chatty mode");
*/

if (yargs.storage) {
	_mockStorage(nativeRequire(`./storage/${yargs.storage}.json`)); // eslint-disable-line global-require
	INFO('Loaded storage from', yargs.storage, ' - loaded ', Object.getOwnPropertyNames(_mockStorage()).length, 'items');
} else {
	INFO('Using empty storage');
}

Init.init();

Init.loadOptions
	.then(() => {
		if (yargs.assertstorage) {
			const actual = _mockStorage();
			const expected = nativeRequire(`./storage/${yargs.assertstorage}.json`);
			INFO('Asserting that storage matches', yargs.assertstorage, ' - loaded ', Object.getOwnPropertyNames(expected).length, 'items');

			let ignoredKeys = [];
			if (yargs.ignorestorage) {
				ignoredKeys = nativeRequire(`./storage/${yargs.ignorestorage}.json`);
				INFO('ignoring keys listed in', yargs.ignorestorage, ' - ignoring ', Object.getOwnPropertyNames(ignoredKeys).length, 'items');
			}

			const failures = [];

			function addError(key, error, expected, actual) {
				if (!error) return;
				DEBUG(key, 'didn\'t match assert storage!', error);
				failures.push({
					error: typeof error === 'boolean' ? 'no match' : error,
					key,
					expected: JSON.stringify(expected),
					actual: JSON.stringify(actual)
				});
			}

			for (const key in expected) {
				if (ignoredKeys.indexOf(key) !== -1) {
					DEBUG('Skipping comparing key', key);
					continue;
				}
				DEBUG('Comparing key', key);
				let expectedValue = 0;
				let actualValue = -1;
				let error = false;
				if (key.indexOf('RESoptions.') === 0) {
					let option;
					try {
						const expectedOptions = typeof expected[key] === 'string' && JSON.parse(expected[key]);
						const actualOptions = typeof actual[key] === 'string' && JSON.parse(actual[key]);
						for (option in expectedOptions) {
							expectedValue = expectedOptions[option].value;
							actualValue = (actualOptions[option] || {}).value;
							error = !equals(expectedValue, actualValue);
							if (error) addError(`${key}::${option}`, error, expectedValue, actualValue);
						}
					} catch (e) {
						addError(`${key}::${option}`, error);
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

		DEBUG('done');
		process.exit();
	})
	.catch(e => {
		INFO('Error: ', e);
		process.exit(1);
	});
