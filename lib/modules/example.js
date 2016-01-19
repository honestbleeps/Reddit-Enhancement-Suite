/************************************************************************************************************

Creating your own module:

All modules must have an ID, which is the first parameter passed into addModule.

In addition, modules must have the following required properties:
- moduleName - a "nice name" for your module
- category - a category such as "Comments" for the module to reside under
- description - an explanation of the module's functionality
- include (optional) - an array of page types or regexes to match against location.href
- exclude (optional) - an array of page types or regexes to exclude against location.href
- beforeLoad (optional) code to run after <head> is ready and this module's options are loaded
- go - code to run after <body> is ready. Always checks if both isEnabled() and isMatchURL(), and if so, runs your main code.

Add the file to all the browser manifests! You can use `gulp add-module --file module.js` (replace `module.js` with your filename).

************************************************************************************************************/

addModule('myModule', function(module, moduleID) {
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
		if ((module.isEnabled()) && (module.isMatchURL())) {
			// Do stuff now!
			// This is where your code goes...
		}
	};
});
