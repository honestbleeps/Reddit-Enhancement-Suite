import './mocks';

import expected from 'json!./storage/andytuba-4.5.4-6dffad39.json';
import ignoredKeys from 'json!./storage/_ignore-4.5.4-6dffad39.json';
import storage from 'json!./storage/andytuba-4.5.4.json';

import * as Init from '../lib/core/init';
import { _mockStorage } from './environment';
import { nativeRequire } from '../lib/environment/_nativeRequire';

const _yargs = nativeRequire('yargs');
const equals = nativeRequire('deep-equal');

const yargs = _yargs
	.count('verbose')
    .alias('v', 'verbose')
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

_mockStorage(storage);
INFO('Loaded storage from - loaded', Object.keys(storage).length, 'items');

Init.init();

Init.loadOptions
	.then(() => {
		const actual = _mockStorage();

		INFO('Asserting that storage matches -', Object.keys(expected).length, 'items');
		INFO('Ignoring keys -', Object.keys(ignoredKeys).length, 'items');

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
			if (key.startsWith('RESoptions.')) {
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

		DEBUG('done');
		process.exit();
	})
	.catch(e => {
		INFO('Error: ', e);
		process.exit(1);
	});
