/* eslint-env node */
/* exported location, document, sessionStorage, alert */

var MockBrowser = require('mock-browser').mocks.MockBrowser;
var mock = new MockBrowser();
var $ = require('jquery')({ document: mock.getDocument() });



var location = {
	'hash': '',
	'search': '',
	'pathname': '/',
	'port': '',
	'hostname': 'www.reddit.com',
	'host': 'www.reddit.com',
	'protocol': 'https:',
	'origin': 'https://www.reddit.com',
	'href': 'https://www.reddit.com/',
	'ancestorOrigins': {}
};

var document = {
	location: location,
	createElement: function(tagName) {
		return {
			tagName: tagName,
			style: {}
		};
	}
};

var sessionStorage = {
	getItem: function() {
		return undefined;
	}
};

function alert(msg) {
	console.error('[ALERT]', msg);
}

exports.location = location;
exports.document = document;
exports.sessionStorage = sessionStorage;
exports.DOMParser = require('xmldom').DOMParser;
exports.alert = alert;
exports.$ = $;
