var fs = require('fs');
var _eval = require('eval');
var yargs = require('yargs').argv;
var files = require("./files.json");

var MockBrowser = require('mock-browser').mocks.MockBrowser;
var mock = new MockBrowser();
console.log('Loading jQuery');
/* global */ $ = require('jquery')({ document: mock.getDocument() });
console.log('loaded jQuery');

var fileList = [];
for (var section in files) {
	if (files[section].length) {
		fileList = fileList.concat(files[section]);

		fileList.forEach(function(filename) { importFile(filename); });
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
	console.log('Loading', filename, key ? 'as ' + key : '');
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
	if (exported) console.log('    -->', exported);
}

console.log('done');
