/* @flow */

import { Module } from '../core/module';

export const module: Module<*> = new Module('moduleId');

module.moduleName = 'Readable module name';
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
		description: 'Explanation of what this option is for',
	},
	doSpecialStuff: {
		type: 'boolean',
		value: false,
		description: 'Explanation of what this option is for',
	},
};

// See PageType (utils/location.js) for other page types
module.include = ['linklist']; // Optional: defaults to including all pages
module.exclude = []; // Optional: defaults to excluding no pages

module.beforeLoad = () => { // Optional: runs after <head> is ready and the module's options are loaded
	// Preload stuff if necessary
};

module.go = () => { // Optional: runs after <body> is ready and `beforeLoad` (in all modules) is complete
	// Do stuff now!
	// This is where your code goes...
};

module.afterLoad = () => { // Optional: runs after `go` (in all modules) is complete
	// Do unimportant stuff after everything else is done
};
