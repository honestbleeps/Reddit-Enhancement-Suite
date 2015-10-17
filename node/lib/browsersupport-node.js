/* exported location, document */

// Mocks

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

exports.location = location;
exports.document = document;
exports.sessionStorage = sessionStorage;
