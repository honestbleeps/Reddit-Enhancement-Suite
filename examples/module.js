/* @flow */

import { Module } from '../core/module';

export const module: Module<*> = new Module('myModule');

module.moduleName = 'myModuleName'; // add the friendly name to locales/locales/en.js for i18n
module.category = 'browsingCategory'; // categories from locales/locales/en.js
module.description = 'myModuleDesc'; // i18n
module.options = {
	// Any configurable options go here.
	// Options must have a type and a value..
	// Valid types: text, boolean, color (in hexadecimal form), list
	// For example:
	defaultMessage: {
		type: 'text',
		value: 'This is default text',
		description: 'myModuleDefaultMessageDesc', // i18n
	},
	doSpecialStuff: {
		type: 'boolean',
		value: false,
		description: 'myModuleDoSpecialStuffDesc', // i18n
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
