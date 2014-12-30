var RESVersion = '4.5.4';
var RESdefaultModuleID = 'contribute';  // Show this module by default when opening settings

var jQuery, $, guiders, Favico, SnuOwnd;

/*
	Reddit Enhancement Suite - a suite of tools to enhance Reddit
	Copyright (C) 2010-2014 - honestbleeps (steve@honestbleeps.com)

	RES is released under the GPL. However, I do ask a favor (obviously I don't/can't require it, I ask out of courtesy):

	Because RES auto updates and is hosted from a central server, I humbly request that if you intend to distribute your own
	modified Reddit Enhancement Suite, you name it something else and make it very clear to your users that it's your own
	branch and isn't related to mine.

	RES is updated very frequently, and I get lots of tech support questions/requests from people on outdated versions. If
	you're distributing RES via your own means, those recipients won't always be on the latest and greatest, which makes
	it harder for me to debug things and understand (at least with browsers that auto-update) whether or not people are on
	a current version of RES.

	I can't legally hold you to any of this - I'm just asking out of courtesy.

	Thanks, I appreciate your consideration.  Without further ado, the all-important GPL Statement:

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/


// DOM utility functions
var escapeLookups = {
	'&': '&amp;',
	'"': '&quot;',
	'<': '&lt;',
	'>': '&gt;'
};

function escapeHTML(str) {
	return (typeof str === 'undefined' || str === null) ?
		null :
		str.toString().replace(/[&"<>]/g, function(m) {
			return escapeLookups[m];
		});
}

// this alias is to account for opera having different behavior...
if (typeof navigator === 'undefined') {
	navigator = window.navigator;
}

//Because Safari 5.1 doesn't have Function.bind
if (typeof Function.prototype.bind === 'undefined') {
	Function.prototype.bind = function(context) {
		var oldRef = this;
		return function() {
			return oldRef.apply(context || null, Array.prototype.slice.call(arguments));
		};
	};
}

var safeJSON = {
	// safely parses JSON and won't kill the whole script if JSON.parse fails
	// if localStorageSource is specified, will offer the user the ability to delete that localStorageSource to stop further errors.
	// if silent is specified, it will fail silently...
	parse: function(data, localStorageSource, silent) {
		try {
			data = BrowserStrategy.sanitizeJSON(data);
			return JSON.parse(data);
		} catch (error) {
			if (silent) {
				return {};
			}
			if (localStorageSource) {
				var msg = 'Error caught: JSON parse failure on the following data from "' + localStorageSource + '": <textarea rows="5" cols="50">' + data + '</textarea><br>RES can delete this data to stop errors from happening, but you might want to copy/paste it to a text file so you can more easily re-enter any lost information.';
				alert(msg, function() {
					// back up a copy of the corrupt data
					localStorage.setItem(localStorageSource + '.error', data);
					// delete the corrupt data
					RESStorage.removeItem(localStorageSource);
				});
			} else {
				alert('Error caught: JSON parse failure on the following data: ' + data);
			}
			return {};
		}
	}
};

var modules = {};
function addModule(moduleID, defineModule) {
	var base = {
		moduleID: moduleID,
		moduleName: moduleID,
		category: 'General',
		options: {},
		description: '',
		isEnabled: function() {
			return RESConsole.getModulePrefs(this.moduleID);
		},
		isMatchURL: function() {
			return RESUtils.isMatchURL(this.moduleID);
		},
		include: [
			'all'
		],
		exclude: [],
		beforeLoad: function() { },
		go: function() { }
	};

	var module = defineModule.call(base, base, moduleID) || base;
	modules[moduleID] = module;
}



/************************************************************************************************************

Creating your own module:

All modules must have an ID, which is the first parameter passed into addModule.

In addition, modules must have the following required properties:
- moduleName - a "nice name" for your module
- category - a category such as "Comments" for the module to reside under
- description - an explanation of the module's functionality
- include - an array of regexes (or RESUtils page types) to match against location.href
- exclude (optional) - an array of regexes (or RESUtils page types) to exclude against location.href
- go - always checks if both isEnabled() and isMatchURL(), and if so, runs your main code.

addModule('myModule', function(module, moduleID) {
	module.moduleName = 'my module';
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
	module.include = [
		'profile',
		/^https?:\/\/([a-z]+)\.reddit\.com\/message\/comments\/[-\w\.]+/i
	];

	module.go = function() {
		if ((module.isEnabled()) && (module.isMatchURL())) {
			// Do stuff now!
			// This is where your code goes...
		}
	};
});

************************************************************************************************************/

var lastPerf = 0;

function perfTest(name) {
	var now = Date.now();
	var diff = now - lastPerf;
	console.log(name + ' executed. Diff since last: ' + diff + 'ms');
	lastPerf = now;
}
