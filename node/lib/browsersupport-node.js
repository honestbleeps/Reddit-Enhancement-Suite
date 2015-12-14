/* eslint-env node */
/* exported RESEnvironment */

var fs = require('fs');
RESEnvironment.loadResourceAsText = function(filename) {
	return Promise.resolve(fs.readFileSync('lib/' + filename, 'utf8'));
};

exports.RESEnvironment = RESEnvironment;
