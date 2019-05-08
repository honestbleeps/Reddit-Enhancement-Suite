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
		title: 'myModuleDefaultMessageTitle', // i18n
		type: 'text',
		value: 'This is default text',
		description: 'myModuleDefaultMessageDesc', // i18n
	},
	doSpecialStuff: {
		title: 'myModuleDoSpecialStuffTitle', // i18n
		type: 'boolean',
		value: false,
		description: 'myModuleDoSpecialStuffDesc', // i18n
	},
};

module.permissions = {
	// extra permissions this module requires; these permissions must be listed in the
	//   optional_permissions section of the manifest file
	requiredPermissions: ['webRequest'],
	// if any of the optional permissions we're requesting will result in a warning prompt,
	//   (see https://developer.chrome.com/apps/permission_warnings#permissions_with_warnings)
	//   being shown to the user, use this field to explain to the user why we need the permission(s)
	message: 'This module needs some extra permissions to function',
};

// See PageType (utils/location.js) for other page types
module.include = ['linklist']; // Optional: defaults to including all pages
module.exclude = []; // Optional: defaults to excluding no pages

module.beforeLoad = () => { // Optional: runs after the module's options are loaded
	// Preload stuff if necessary
};

module.contentStart = () => { // Optional: runs when the first Thing (and its children) is ready; at this stage is also the header and sidebar ready
	// Do stuff now!
	// This is where your code goes...
};

module.go = () => { // Optional: runs after <body> is ready and `beforeLoad` (in all modules) is complete
	// Do stuff now!
	// This is where your code goes...
};

module.afterLoad = () => { // Optional: runs after `go` (in all modules) is complete
	// Do unimportant stuff after everything else is done
};
