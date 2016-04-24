/*

Modules must have the following required properties:
- moduleID
- moduleName - a "nice name" for your module
- category - a category such as "Comments" for the module to reside under
- description - an explanation of the module's functionality
- include (optional) - an array of page types or regexes to match against location.href
- exclude (optional) - an array of page types or regexes to exclude against location.href
- beforeLoad (optional) - code to run after <head> is ready and this module's options are loaded
- always (optional) - run at the same time as beforeLoad, regardless of whether or not the module is enabled
- go (optional) - code to run after <body> is ready
- afterLoad (optional) - code to run after `go`
beforeLoad, go, and afterLoad will only run if the module is enabled and the include/exclude match the current page.


See the README for info on adding your module to the browsers' manifests.

*/

export const module = {};

module.moduleID = 'myModule';
module.moduleName = 'My Module';
module.category = 'CategoryName';
module.description = 'This is my module!';
module.options = {
	// Any configurable options go here.
	// Options must have a type and a value..
	// Valid types: text, boolean, color (in hexadecimal form), list
	// For example:
	defaultMessage: {
		type: 'text',
		value: 'This is default text',
		description: 'Explanation of what this option is for'
	},
	doSpecialStuff: {
		type: 'boolean',
		value: false,
		description: 'Explanation of what this option is for'
	}
};

// See RESUtils.pageType (utils.js) for other page types
module.include = [
	'all'
];
module.exclude = [
];

module.go = function() {
	// Do stuff now!
	// This is where your code goes...
};
