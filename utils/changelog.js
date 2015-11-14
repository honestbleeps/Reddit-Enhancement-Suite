#!/usr/bin/env node
// var lastVersionDate = '2014-04-03'; // 4.3.2.1
// var lastVersionDate = '2014-07-02'; // 4.5.0.1
// var lastVersionDate = '2014-07-07'; // 4.5.0.2
// var lastVersionDate = '2014-09-13'; // 4.5.1
// var lastVersionDate = '2014-10-13'; // 4.5.2
// var lastVersionDate = '2014-12-18'; // 4.5.3
var lastVersionDate = '2014-12-29'; // 4.5.4

/*

INSTALLATION
	Depends on https://github.com/andytuba/github-changelog

USAGE:

	# Update lastVersionDate first
	cd Reddit-Enhancement-Suite/utils/
	node changelog.js
*/


var changelog = require('../node_modules/github-changelog/core.js');
var credentials = {};
try {
	credentials = require('../../github-credentials.json');
} catch(e) {
	/*
	console.warn('Could not load credentials');
	console.warn(e);
	process.exit(1);
	*/
}


var baseOptions = {
	owner: 'honestbleeps',
	repo: 'Reddit-Enhancement-Suite',
	template: 'changelog.hbs',
	events: 'events.json',
	label_fixed: 'Closed-Fixed',
	label_wontfix: 'Closed-WontFix',
	since: lastVersionDate,
};
baseOptions = extend(baseOptions, credentials);


var optionsSet = [
 	extend(baseOptions, { header: 'Feature Requests', labels: 'Concern-Request' }),
	extend(baseOptions, { header: 'Usability Enhancements', labels: 'Concern-UX' }),
	extend(baseOptions, { header: 'Bug Fixes', labels: 'Bug-Confirmed' }),
];


asyncForeach(optionsSet, function(options, next) {
	changelog.run(extend(options, { done: next }));
});


function asyncForeach(array, callback) {
	var i = 0, length = array.length;
	process.nextTick(go);
	function go() {
		if (i < length) {
			var element = array[i];
			callback(element, function() {
				i++;
				go();
			});
		}
	}
}



function extend() {
	var extended = {};

	for (var i = 0, length = arguments.length; i < length; i++) {
		var source = arguments[i];

		for (var key in source) {
			if (!source.hasOwnProperty(key)) continue;
			extended[key] = source[key];
		}
	}

	return extended;
}
