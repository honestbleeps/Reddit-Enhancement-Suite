/* eslint-env node */
/* exported RESEnvironment */

var fs = require('fs');
RESEnvironment.loadResourceAsText = function(filename, callback) {
	callback(fs.readFileSync('lib/' + filename, 'utf8'));
};

exports.RESEnvironment = RESEnvironment;
