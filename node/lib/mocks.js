/* exported location, document, sessionStorage, alert */

var location = {"hash":"","search":"","pathname":"/","port":"","hostname":"www.reddit.com","host":"www.reddit.com","protocol":"https:","origin":"https://www.reddit.com","href":"https://www.reddit.com/","ancestorOrigins":{}};

var document = {
	location: location,
	createElement: function(tagName) {
		return {};
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
