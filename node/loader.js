var fs = require('fs');
var _eval = require('eval');
var requireNew = require('require-new');
var yargs = require('yargs').argv;
var files = require("./files.json");
var equals = require('deep-equal');

var MockBrowser = require('mock-browser').mocks.MockBrowser;
var mock = new MockBrowser();
/* global */ $ = require('jquery')({ document: mock.getDocument() });

var skipSections = [].concat(yargs.skip);
for (var section in files) {
	if (skipSections.indexOf(section) !== -1) continue;

	if (files[section].length) {
		files[section].forEach(function(filename) { importFile(filename); });
	}
	else if (typeof files[section] === 'object') {
		for (var key in files[section]) {
			if (!files[section].hasOwnProperty(key)) continue;
			importFile(files[section][key], key);
		}
	}
}
function importFile(filename, key) {
	filename = 'lib/' + filename;
	var contents = fs.readFileSync(filename, 'utf8');
	if (yargs.v) console.log('Loading', filename, key ? 'as ' + key : '');
	var exports = _eval(contents, filename, {}, true);
	if (key) {
		global[key] = exports;
	} else {
		for (var key in exports) {
			if (!exports.hasOwnProperty(key)) continue;
			global[key] = exports[key];
		}
	}
	var exported = Object.getOwnPropertyNames(exports).join(', ');
	if (yargs.v && exported) console.log('    -->', exported);
}


if (yargs.storage) {
	var storage = require('./storage/' + yargs.storage + '.json');
	console.log('Loaded storage from', yargs.storage);
	RESStorage.setup.complete(storage);
} else {
	if (yargs.v) console.log('Using empty storage');
	RESStorage.setup.complete({});
}

if (yargs.assertstorage) {
	var actual = RESStorage;
	var expected = requireNew('./storage/' + yargs.assertstorage + '.json');
	if (yargs.v) console.log('Asserting that storage resembles', yargs.assertstorage);

	var failures = [];
	for (var key in expected) {
		var expectedValue = 0, actualValue = -1, error = false;
		if (key.indexOf('RESoptions.') === 0) {
			try {
			 	expectedValue = typeof expected[key] === 'string' && JSON.parse(expected[key]).value;
				actualValue = typeof actual[key] === 'string' && JSON.parse(actual[key]).value;
				error = !equals(expectedValue, actualValue);
			} catch (e) {
				error = e;
			}
		} else {
			expectedValue = expected[key];
			actualValue = actual[key];
			error = !equals(expectedValue, actualValue);
		}

		if (error) {
			failures.push({
				error: typeof error === 'boolean' ? 'no match' : error,
				key: key,
				expected: expected[key],
				actual: actual[key]
			});
		}
	}
	if (failures.length) {
		console.log('[ERR] Encountered', failures.length, 'non-matching storage items');
		console.dir(failures);
	}
}

if (yargs.v) console.log('done');
process.exit();
