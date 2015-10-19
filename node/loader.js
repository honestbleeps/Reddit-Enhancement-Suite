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
	}
}

fileList.forEach(function(filename) {
	filename = 'lib/' + filename;
	var contents = fs.readFileSync(filename, 'utf8');
	console.log('Loading', filename);
	var exports = _eval(contents, filename, {}, true);
	for (var key in exports) {
		if (!exports.hasOwnProperty(key)) continue;
		global[key] = exports[key];
	}
	var exported = Object.getOwnPropertyNames(exports).join(', ');
	if (exported) console.log('    -->', exported);
});

console.log('done');
