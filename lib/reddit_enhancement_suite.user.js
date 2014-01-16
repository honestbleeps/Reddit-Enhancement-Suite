/*jshint undef: true, unused: true, strict: false, laxbreak: true, multistr: true, smarttabs: true, sub: true, browser: true */

var RESVersion = "4.3.1.2";

var jQuery, $, guiders, Tinycon, SnuOwnd;

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
	"&": "&amp;",
	'"': "&quot;",
	"<": "&lt;",
	">": "&gt;"
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
			if (BrowserDetect.isSafari()) {
				if (data.substring(0, 2) === 's{') {
					data = data.substring(1, data.length);
				}
			}
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
			/^https?:\/\/([a-z]+)\.reddit\.com\/[\?]*/i
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

Modules must have the following format, with required functions:
- moduleID - the name of the module, i.e. myModule
- moduleName - a "nice name" for your module...
- description - for the config panel, explains what the module is
- isEnabled - should always return RESConsole.getModulePrefs('moduleID') - where moduleID is your module name.
- isMatchURL - should always return RESUtils.isMatchURL('moduleID') - checks your include and exclude URL matches.
- include - an array of regexes to match against location.href (basically like include in GM)
- exclude (optional) - an array of regexes to exclude against location.href
- go - always checks both if isEnabled() and if RESUtils.isMatchURL(), and if so, runs your main code.

modules['myModule'] = {
	moduleID: 'myModule',
	moduleName: 'my module',
	category: 'CategoryName',
	options: {
		// any configurable options you have go here...
		// options must have a type and a value.. 
		// valid types are: text, boolean (if boolean, value must be true or false)
		// for example:
		defaultMessage: {
			type: 'text',
			value: 'this is default text',
			description: 'explanation of what this option is for'
		},
		doSpecialStuff: {
			type: 'boolean',
			value: false,
			description: 'explanation of what this option is for'
		}
	},
	description: 'This is my module!',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/user\/[-\w\.]+/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/message\/comments\/[-\w\.]+/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// do stuff now!
			// this is where your code goes...
		}
	}
}; // note: you NEED this semicolon at the end!

************************************************************************************************************/





// RES Pro needs some work still... not ready yet.
/*
modules['RESPro'] = {
	moduleID: 'RESPro',
	moduleName: 'RES Pro',
	category: 'Pro Features',
	options: {
		// any configurable options you have go here...
		// options must have a type and a value.. 
		// valid types are: text, boolean (if boolean, value must be true or false)
		// for example:
		username: {
			type: 'text',
			value: '',
			description: 'Your RES Pro username'
		},
		password: {
			type: 'password',
			value: '',
			description: 'Your RES Pro password'
		},
		syncFrequency: {
			type: 'enum',
			values: [
				{ name: 'Hourly', value: '3600000' },
				{ name: 'Daily', value: '86400000' },
				{ name: 'Manual Only', value: '-1' }
			],
			value: '86400000',
			description: 'How often should RES automatically sync settings?'
		}
	},
	description: 'RES Pro allows you to sync settings and data to a server. It requires an account, which you can sign up for <a href="http://reddit.honestbleeps.com/register.php">here</a>',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/?/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]+/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// do stuff now!
			// if we haven't synced in more than our settings, and settings != manual, sync!
			if (this.options.syncFrequency.value > 0) {
				var lastSync = parseInt(RESStorage.getItem('RESmodules.RESPro.lastSync'), 10) || 0;
				var now = Date.now();
				if ((now - lastSync) > this.options.syncFrequency.value) {
					this.authenticate(this.autoSync);
				}
			}

		}
	},
	autoSync: function() {
		modules['RESPro'].authenticate(modules['RESPro'].savePrefs);
		
		// modules['RESPro'].authenticate(function() {
		//	modules['RESPro'].saveModuleData('saveComments');
		// });
	},
	saveModuleData: function(module) {
		switch(module){
			case 'userTagger':
				// THIS IS NOT READY YET!  We need to merge votes on the backend.. hard stuff...
				// in this case, we want to send the JSON from RESmodules.userTagger.tags;
				var tags = RESStorage.getItem('RESmodules.userTagger.tags');
				GM_xmlhttpRequest({
					method:	"POST",
					url:	'http://reddit.honestbleeps.com/RESsync.php',
					data: 'action=PUT&type=module_data&module='+module+'&data='+tags,
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					onload:	function(response) {
						var resp = JSON.parse(response.responseText);
						// console.log(resp);
						if (resp.success) {
							if (RESConsole.proUserTaggerSaveButton) RESConsole.proUserTaggerSaveButton.textContent = 'Saved!';
						} else {
							alert(response.responseText);
						}
					}
				});
				break;
			case 'saveComments':
				var savedComments = RESStorage.getItem('RESmodules.saveComments.savedComments');
				GM_xmlhttpRequest({
					method:	"POST",
					url:	'http://reddit.honestbleeps.com/RESsync.php',
					data: 'action=PUT&type=module_data&module='+module+'&data='+savedComments,
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					onload:	function(response) {
						// console.log(response.responseText);
						var resp = JSON.parse(response.responseText);
						if (resp.success) {
							if (RESConsole.proSaveCommentsSaveButton) RESConsole.proSaveCommentsSaveButton.textContent = 'Saved!';
							var thisComments = safeJSON.parse(savedComments);
							delete thisComments.RESPro_add;
							delete thisComments.RESPro_delete;
							thisComments = JSON.stringify(thisComments);
							RESStorage.setItem('RESmodules.saveComments.savedComments',thisComments);
							modules['notifications'].showNotification({
								header: 'RES Pro Notification', 
								message: 'Saved comments synced to server'
							});
						} else {
							alert(response.responseText);
						}
					}
				});
				break;
			case 'subredditManager':
				var subredditManagerData = {};
				subredditManagerData.RESPro = {};

				for (var key in RESStorage) {
					// console.log(key);
					if (key.indexOf('RESmodules.subredditManager') !== -1) {
						var keySplit = key.split('.');
						var username = keySplit[keySplit.length-1];
						if ((keySplit.indexOf('subredditsLastViewed') === -1) && (keySplit.indexOf('subreddits') === -1)) {
							// console.log(key);
							(keySplit.indexOf('RESPro') !== -1) ? subredditManagerData.RESPro[username] = JSON.parse(RESStorage[key]) : subredditManagerData[username] = JSON.parse(RESStorage[key]);
							// if (key.indexOf('RESPro') === -1) console.log(username + ' -- ' + RESStorage[key]);
							if (key.indexOf('RESPro') !== -1) RESStorage.removeItem('RESmodules.subredditManager.subredditShortcuts.RESPro.'+username);
						}
					}
				}
				var stringData = JSON.stringify(subredditManagerData);
				stringData = encodeURIComponent(stringData);
				GM_xmlhttpRequest({
					method:	"POST",
					url:	'http://reddit.honestbleeps.com/RESsync.php',
					data: 'action=PUT&type=module_data&module='+module+'&data='+stringData,
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					onload:	function(response) {
						console.log(response.responseText);
						var resp = JSON.parse(response.responseText);
						if (resp.success) {
							if (RESConsole.proSubredditManagerSaveButton) RESConsole.proSubredditManagerSaveButton.textContent = 'Saved!';
							modules['notifications'].showNotification({
								header: 'RES Pro Notification', 
								message: 'Subreddit shortcuts synced to server'
							});
						} else {
							alert(response.responseText);
						}
					}
				});
				break;
			default:
				console.log('invalid module specified: ' + module);
				break;
		}
	},
	getModuleData: function(module) {
		switch(module){
			case 'saveComments':
				if (RESConsole.proSaveCommentsGetButton) RESConsole.proSaveCommentsGetButton.textContent = 'Loading...';
				GM_xmlhttpRequest({
					method:	"POST",
					url:	'http://reddit.honestbleeps.com/RESsync.php',
					data: 'action=GET&type=module_data&module='+module,
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					onload:	function(response) {
						var resp = JSON.parse(response.responseText);
						if (resp.success) {
							var serverResponse = JSON.parse(response.responseText);
							var serverData = serverResponse.data;
							currentData = safeJSON.parse(RESStorage.getItem('RESmodules.saveComments.savedComments'), 'RESmodules.saveComments.savedComments');
							for (var attrname in serverData) {
								if (typeof currentData[attrname] === 'undefined') {
									currentData[attrname] = serverData[attrname];
								} 
							}
							// console.log(JSON.stringify(prefsData));
							RESStorage.setItem('RESmodules.saveComments.savedComments', JSON.stringify(currentData));
							if (RESConsole.proSaveCommentsGetButton) RESConsole.proSaveCommentsGetButton.textContent = 'Saved Comments Loaded!';
						} else {
							alert(response.responseText);
						}
					}
				});
				break;
			case 'subredditManager':
				if (RESConsole.proSubredditManagerGetButton) RESConsole.proSubredditManagerGetButton.textContent = 'Loading...';
				GM_xmlhttpRequest({
					method:	"POST",
					url:	'http://reddit.honestbleeps.com/RESsync.php',
					data: 'action=GET&type=module_data&module='+module,
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					onload:	function(response) {
						var resp = JSON.parse(response.responseText);
						if (resp.success) {
							var serverResponse = JSON.parse(response.responseText);
							var serverData = serverResponse.data;
							for (var username in serverResponse.data) {
								var newSubredditData = serverResponse.data[username];
								var oldSubredditData = safeJSON.parse(RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.'+username), 'RESmodules.subredditManager.subredditShortcuts.'+username);
								if (oldSubredditData == null) oldSubredditData = [];
								for (var newidx in newSubredditData) {
									var exists = false;
									for (var oldidx in oldSubredditData) {
										if (oldSubredditData[oldidx].subreddit == newSubredditData[newidx].subreddit) {
											oldSubredditData[oldidx].displayName = newSubredditData[newidx].displayName;
											exists = true;
											break;
										}
									}
									if (!exists) {
										oldSubredditData.push(newSubredditData[newidx]);
									}
								}
								RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.'+username,JSON.stringify(oldSubredditData));
							}
						} else {
							alert(response.responseText);
						}
					}
				});
				break;
			default:
				console.log('invalid module specified: ' + module);
				break;
		}
	},
	savePrefs: function() {
		// (typeof unsafeWindow !== 'undefined') ? ls = unsafeWindow.localStorage : ls = localStorage;
		if (RESConsole.proSaveButton) RESConsole.proSaveButton.textContent = 'Saving...';
		var RESOptions = {};
		// for (var i = 0, len=ls.length; i < len; i++) {
		for(var i in RESStorage) {
			if ((typeof RESStorage.getItem(i) !== 'function') && (typeof RESStorage.getItem(i) !== 'undefined')) {
				var keySplit = i.split('.');
				if (keySplit) {
					var keyRoot = keySplit[0];
					switch (keyRoot) {
						case 'RES':
							var thisNode = keySplit[1];
							if (thisNode === 'modulePrefs') {
								RESOptions[thisNode] = safeJSON.parse(RESStorage.getItem(i), i);
							}
							break;
						case 'RESoptions':
							var thisModule = keySplit[1];
							if (thisModule !== 'accountSwitcher') {
								RESOptions[thisModule] = safeJSON.parse(RESStorage.getItem(i), i);
							}
							break;
						default:
							//console.log('Not currently handling keys with root: ' + keyRoot);
							break;
					}
				}
			}
		}
		// Post options blob.
		var RESOptionsString = JSON.stringify(RESOptions);
		GM_xmlhttpRequest({
			method:	"POST",
			url:	'http://reddit.honestbleeps.com/RESsync.php',
			data: 'action=PUT&type=all_options&data='+RESOptionsString,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			onload:	function(response) {
				var resp = JSON.parse(response.responseText);
				// console.log(resp);
				if (resp.success) {
					var now = Date.now();
					RESStorage.setItem('RESmodules.RESPro.lastSync',now);
					if (RESConsole.proSaveButton) RESConsole.proSaveButton.textContent = 'Saved.';
					modules['notifications'].showNotification({
						header: 'RES Pro Notification',
						message: 'RES Pro - module options saved to server.'
					});
				} else {
					alert(response.responseText);
				}
			}
		});
	},
	getPrefs: function() {
		console.log('get prefs called');
		if (RESConsole.proGetButton) RESConsole.proGetButton.textContent = 'Loading...';
		GM_xmlhttpRequest({
			method:	"POST",
			url:	'http://reddit.honestbleeps.com/RESsync.php',
			data: 'action=GET&type=all_options',
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			onload:	function(response) {
				var resp = JSON.parse(response.responseText);
				if (resp.success) {
					var modulePrefs = JSON.parse(response.responseText);
					var prefsData = modulePrefs.data;
					//console.log('prefsData:');
					//console.log(prefsData);
					for (var thisModule in prefsData){
						if (thisModule === 'modulePrefs') {
							var thisOptions = prefsData[thisModule];
							RESStorage.setItem('RES.modulePrefs',JSON.stringify(thisOptions));
						} else {
							var thisOptions = prefsData[thisModule];
							RESStorage.setItem('RESoptions.'+thisModule,JSON.stringify(thisOptions));
						}
					}
					if (RESConsole.proGetButton) RESConsole.proGetButton.textContent = 'Preferences Loaded!';
					modules['notifications'].showNotification({
						header: 'RES Pro Notification',
						message: 'Module options loaded.'
					});
					// console.log(response.responseText);
				} else {
					alert(response.responseText);
				}
			}
		});
	},
	configure: function() {
		if (!RESConsole.isOpen) RESConsole.open();
		RESConsole.menuClick(document.getElementById('Menu-'+this.category));
		RESConsole.drawConfigOptions('RESPro');
	},
	authenticate: function(callback) {
		if (! this.isEnabled()) {
			return false;
		} else if ((modules['RESPro'].options.username.value === '') || (modules['RESPro'].options.password.value === '')) {
			modules['RESPro'].configure();
		} else if (RESStorage.getItem('RESmodules.RESPro.lastAuthFailed') !== 'true') {
			if (typeof modules['RESPro'].lastAuthFailed === 'undefined') {
				GM_xmlhttpRequest({
					method:	"POST",
					url:	'http://reddit.honestbleeps.com/RESlogin.php',
					data: 'uname='+modules['RESPro'].options.username.value+'&pwd='+modules['RESPro'].options.password.value,
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					onload:	function(response) {
						var resp = JSON.parse(response.responseText);
						if (resp.success) {
							// RESConsole.proAuthButton.textContent = 'Authenticated!';
							RESStorage.removeItem('RESmodules.RESPro.lastAuthFailed');
							if (callback) {
								callback();
							}
						} else {
							// RESConsole.proAuthButton.textContent = 'Authentication failed.';
							modules['RESPro'].lastAuthFailed = true;
							RESStorage.setItem('RESmodules.RESPro.lastAuthFailed','true');
							modules['notifications'].showNotification({
								header: 'RES Pro Notification', 
								message: 'Authentication failed - check your username and password.'
							});
						}
					}
				});
			}
		}
	}
}; 
*/
modules['RESTips'] = {
	moduleID: 'RESTips',
	moduleName: 'RES Tips and Tricks',
	category: 'UI',
	options: {
		// any configurable options you have go here...
		// options must have a type and a value.. 
		// valid types are: text, boolean (if boolean, value must be true or false)
		// for example:
		dailyTip: {
			type: 'boolean',
			value: true,
			description: 'Show a random tip once every 24 hours.'
		}
	},
	description: 'Adds tips/tricks help to RES console',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[\?]*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if (this.isEnabled() && this.isMatchURL()) {
			RESUtils.addCSS('.res-help { cursor: help; }');
			RESUtils.addCSS('.res-help #resHelp { cursor: default; }');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.menuItem = RESUtils.createElementWithID('li', 'RESTipsMenuItem');
			this.menuItem.textContent = 'tips & tricks';
			this.menuItem.addEventListener('click', function(e) {
				modules['RESTips'].randomTip();
			}, false);

			$('#RESDropdownOptions').append(this.menuItem);

			if (this.options.dailyTip.value) {
				this.dailyTip();
			}

			/*
			guiders.createGuider({
				attachTo: '#RESSettingsButton',
				// buttons: [{name: "Next"}],
				description: "Guiders are a user interface design pattern for introducing features of software. This dialog box, for example, is the first in a series of guiders that together make up a guide.",
				id: "first",
				// next: "second",
				overlay: true,
				xButton: true,
				title: "Welcome to Guiders.js!"
			}).show();
			*/
			/*
			setTimeout(function() {
				guiders.createGuider({
					  attachTo: "#RESSettingsButton",
					  buttons: [{name: "Close"},
								{name: "Next"}],
					  description: "This is just some sorta test guider, here... woop woop.",
					  id: "first",
					  next: "second",
					  // offset: { left: -200, top: 120 },
					  position: 5,
					  title: "Guiders are typically attached to an element on the page."
				}).show();
				guiders.createGuider({
					  attachTo: "a.toggleImage:first",
					  buttons: [{name: "Close"},
								{name: "Next"}],
					  description: "An example of an image expando",
					  id: "second",
					  next: "third",
					  // offset: { left: -200, top: 120 },
					  position: 3,
					  title: "Guiders are typically attached to an element on the page."
				});
			}, 2000);
			*/
		}
	},
	handleEscapeKey: function(event) {
		if (event.which === 27) {
			this.hideTip();
		}
	},
	dailyTip: function() {
		var lastCheck = parseInt(RESStorage.getItem('RESLastToolTip'), 10) || 0;
		var now = Date.now();
		// 86400000 = 1 day
		if ((now - lastCheck) > 86400000) {
			// mark off that we've displayed a new tooltip
			RESStorage.setItem('RESLastToolTip', now);
			if (lastCheck === 0) {
				this.showTip(0);
			} else {
				setTimeout(function() {
					modules['RESTips'].randomTip();
				}, 500);
			}
		}
	},
	randomTip: function() {
		this.currTip = Math.floor(Math.random() * this.tips.length);
		this.showTip(this.currTip);
	},
	disableDailyTipsCheckbox: function(e) {
		modules['RESTips'].options.dailyTip.value = e.target.checked;
		RESStorage.setItem('RESoptions.RESTips', JSON.stringify(modules['RESTips'].options));
	},
	nextTip: function() {
		if (typeof this.currTip === 'undefined') this.currTip = 0;
		modules['RESTips'].nextPrevTip(1);
	},
	prevTip: function() {
		if (typeof this.currTip === 'undefined') this.currTip = 0;
		modules['RESTips'].nextPrevTip(-1);
	},
	nextPrevTip: function(idx) {
		if (typeof this.currTip === 'undefined') this.currTip = 0;
		// if (idx < 0) this.hideTip();
		this.hideTip();
		this.currTip += idx;
		if (this.currTip < 0) {
			this.currTip = this.tips.length - 1;
		} else if (this.currTip >= this.tips.length) {
			this.currTip = 0;
		}
		this.showTip(this.currTip);
	},
	generateTitle: function (help) {
		var title = help.title 
			? help.title
			: 'RES Tips and Tricks';
			
		return title;
	},
	generateContent: function(help, elem) {
		var description = [];

		if (help.message) description.push(help.message);

		if (help.keyboard) {
			// TODO: microtemplate
			var disabled = !modules['keyboardNav'].isEnabled();
			description.push('<h2 class="keyboardNav' + (disabled ? 'keyboardNavDisabled' : '') + '">');
			description.push('Keyboard Navigation' + (disabled ? ' (disabled)' : ''));
			description.push('</h2>');

			var keyboardTable = RESUtils.generateTable(help.keyboard, this.generateContentKeyboard, elem);
			if (keyboardTable) description.push(keyboardTable);
		}

		if (help.option) {
			description.push('<h2 class="settingsPointer">');
			description.push('<span class="gearIcon"></span> RES Settings');
			description.push('</h2>');

			var optionTable = RESUtils.generateTable(help.option, this.generateContentOption, elem);
			if (optionTable) description.push(optionTable);
		}

		description = description.join("\n");
		return description;
	},
	generateContentKeyboard: function(keyboardNavOption, index, array, elem) {
		var keyCode = modules['keyboardNav'].getNiceKeyCode(keyboardNavOption);
		if (!keyCode) return;

		var description = [];
		description.push('<tr>');
		description.push('<td><code>' + keyCode.toLowerCase() + '</code></td>');
		description.push('<td>' + keyboardNavOption + '</td>');
		description.push('</tr><tr>');
		description.push('<td>&nbsp;</td>'); // for styling
		description.push('<td>' + modules['keyboardNav'].options[keyboardNavOption].description + '</td>');
		description.push('</tr>');

		return description;
	},
	generateContentOption: function(option, index, array, elem) {
		var module = modules[option.moduleID];
		if (!module) return;

		var description = [];

		description.push("<tr>");
		description.push("<td>" + module.category + '</td>');

		description.push('<td>');
		description.push(modules['settingsNavigation'].makeUrlHashLink(option.moduleID, null, module.moduleName));
		description.push('</td>');

		description.push('<td>');
		description.push(option.key ? modules['settingsNavigation'].makeUrlHashLink(option.moduleID, option.key) : '&nbsp;');
		description.push('</td>');

		if (module.options[option.key]) {
			description.push('</tr><tr>');
			description.push('<td colspan="3">' + module.options[option.key].description + '</td>');
		}
		description.push("</tr>");

		return description;
	},
	consoleTip: {
		message: "Roll over the gear icon <span class='gearIcon'></span> and click 'settings console' to explore the RES settings.  You can enable, disable or change just about anything you like/dislike about RES!<br><br>Once you've opened the console once, this message will not appear again.",
		attachTo: "#openRESPrefs",
		position: 5
	},
	tips: [{
			message: 'Welcome to RES. You can turn modules on and off, and configure settings for the modules using the gear icon link at the top right. For feature requests, or just help getting a question answered, be sure to subscribe to <a href="http://reddit.com/r/Enhancement">/r/Enhancement</a>.',
			attachTo: "#openRESPrefs",
			position: 5
		}, {
			message: "Click the tag icon next to a user to tag that user with any name you like - you can also color code the tag.",
			attachTo: ".RESUserTagImage:visible",
			position: 3,
			option: { moduleID: 'userTagger' }
		},
		{ 
			message: "If your RES data gets deleted or you move to a new computer, you can restore it from backup. <br><br><b>Firefox</b> especially sometimes loses your RES settings and data. <br><br><a href=\"http://reddit.com/r/Enhancement/wiki/backing_up_res_settings\" target=\"_blank\">Learn where RES stores your data and settings</a></p>",
			title: 'Back up your RES data!'
		},
		{ 
			message: "Don't forget to subscribe to <a href=\"http://reddit.com/r/Enhancement\">/r/Enhancement</a> to keep up to date on the latest versions of RES or suggest features! For bug reports, submit to <a href=\"http://reddit.com/r/RESIssues\">/r/RESIssues</a>" 
		},
		{ 
			message: "Don't want to see posts containing certain keywords? Want to filter out certain subreddits from /r/all? Try the filteReddit module!" ,
			option: { moduleID: 'filteReddit' }
		},
		{ 
			message: "Keyboard Navigation is one of the most underutilized features in RES. You should try it!" ,
			option: { moduleID: 'keyboardNav' },
			keyboard: 'toggleHelp'
		}, {
			message: "Did you know you can configure the appearance of a number of things in RES? For example: keyboard navigation lets you configure the look of the 'selected' box, and commentBoxes lets you configure the borders / shadows.",
			option: [{
				moduleID: 'keyboardNav',
				key: 'focusBGColor'
			}, {
				moduleID: 'styleTweaks',
				key: 'commentBoxes'
			}]
		},

		{
			message: "Do you subscribe to a ton of reddits? Give the subreddit tagger a try, it can make your homepage a bit more readable.",
			option: {
				moduleID: 'subRedditTagger'
			}
		}, {
			message: "If you haven't tried it yet, Keyboard Navigation is great. Just hit ? while browsing for instructions.",
			option: {
				moduleID: 'keyboardNav'
			},
			keyboard: 'toggleHelp'
		}, {
			message: "Roll over a user's name to get information about them such as their karma, and how long they've been a reddit user.",
			option: {
				moduleID: 'userTagger',
				key: 'hoverInfo'
			}
		}, {
			message: "Hover over the 'parent' link in comments pages to see the text of the parent being referred to.",
			option: {
				moduleID: 'showParent'
			}
		}, {
			message: "You can configure the color and style of the User Highlighter module if you want to change how the highlights look.",
			option: {
				moduleID: 'userHighlight'
			}
		}, {
			message: "Not a fan of how comments pages look? You can change the appearance in the Style Tweaks module",
			option: {
				moduleID: 'styleTweaks'
			}
		}, {
			message: "Don't like the style in a certain subreddit? RES gives you a checkbox to disable styles individually - check the right sidebar!"
		}, {
			message: "Looking for posts by submitter, post with photos, or posts in IAmA form? Try out the comment navigator."
		}, {
			message: "Have you seen the <a href=\"http://www.reddit.com/r/Dashboard\">RES Dashboard</a>? It allows you to do all sorts of great stuff, like keep track of lower traffic subreddits, and manage your <a href=\"/r/Dashboard#userTaggerContents\">user tags</a> and <a href=\"/r/Dashboard#newCommentsContents\">thread subscriptions</a>!",
			options: {
				moduleID: 'dashboard'
			}
		}, {
			message: "Sick of seeing these tips?  They only show up once every 24 hours, but you can disable that in the RES Tips and Tricks preferences.",
			option: {
				moduleID: 'RESTips'
			}
		}, {
			message: "Did you know that there is now a 'keep me logged in' option in the Account Switcher? Turn it on if you want to stay logged in to Reddit when using the switcher!",
			option: {
				moduleID: 'accountSwitcher',
				key: 'keepLoggedIn'
			}
		}, {
			message: "See that little [vw] next to users you've voted on?  That's their vote weight - it moves up and down as you vote the same user up / down.",
			option: {
				moduleID: 'userTagger',
				key: 'vwTooltip'
			}
		}
	],
	tour: [
		// array of guiders will go here... and we will add a "tour" button somewhere to start the tour...
	],
	initTips: function() {
		$('body').on('click', '#disableDailyTipsCheckbox', modules['RESTips'].disableDailyTipsCheckbox);

		// create the special "you have never visited the console" guider...
		this.createGuider(0, 'console');
		for (var i = 0, len = this.tips.length; i < len; i++) {
			this.createGuider(i);
		}
	},
	createGuider: function(i, special) {
		if (special === 'console') {
			var thisID = special;
			var thisTip = this.consoleTip;
		} else {
			var thisID = "tip" + i;
			var thisTip = this.tips[i];
		}
		var title = modules['RESTips'].generateTitle(thisTip);
		var description = modules['RESTips'].generateContent(thisTip);
		var attachTo = thisTip.attachTo;
		var nextidx = ((parseInt(i + 1, 10)) >= len) ? 0 : (parseInt(i + 1, 10));
		var nextID = "tip" + nextidx;
		var thisChecked = (modules['RESTips'].options.dailyTip.value) ? 'checked="checked"' : '';
		var guiderObj = {
			attachTo: attachTo,
			buttons: [{
				name: "Prev",
				onclick: modules['RESTips'].prevTip
			}, {
				name: "Next",
				onclick: modules['RESTips'].nextTip
			}],
			description: description,
			buttonCustomHTML: "<label class='stopper'> <input type='checkbox' name='disableDailyTipsCheckbox' id='disableDailyTipsCheckbox' " + thisChecked + " />Show these tips once every 24 hours</label>",
			id: thisID,
			next: nextID,
			onShow: modules['RESTips'].onShow,
			onHide: modules['RESTips'].onHide,
			position: this.tips[i].position,
			xButton: true,
			title: title,
		};
		if (special === 'console') {
			delete guiderObj.buttonCustomHTML;
			delete guiderObj.next;
			delete guiderObj.buttons;

			guiderObj.title = "RES is extremely configurable";
		}

		guiders.createGuider(guiderObj);
	},
	showTip: function(idx, special) {
		if (typeof this.tipsInitialized === 'undefined') {
			this.initTips();
			this.tipsInitialized = true;
		}

		if (!special) {
			guiders.show('tip' + idx);
		} else {
			guiders.show('console');
		}

		$('body').on('keyup', modules['RESTips'].handleEscapeKey);
	},
	hideTip: function() {
		guiders.hideAll();
		$('body').off('keyup', modules['RESTips'].handleEscapeKey);
	},
	onShow: function() {
		modules['styleTweaks'].setSRStyleToggleVisibility(false, 'tipstricks');
	},
	onHide: function() {
		modules['styleTweaks'].setSRStyleToggleVisibility(true, 'tipstricks');
	}
};


modules['settingsNavigation'] = {
	moduleID: 'settingsNavigation',
	moduleName: 'RES Settings Navigation',
	category: 'UI',
	description: 'Helping you get around the RES Settings Console with greater ease',
	hidden: true,
	options: {},
	isEnabled: function() {
		// return RESConsole.getModulePrefs(this.moduleID);
		return true;
	},
	include: [
		/^https?:\/\/([-\w\.]+\.)?reddit\.com\/[-\w\.\/]*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		RESUtils.addCSS('#RESSearchMenuItem { \
			display: block;	\
			float: right;	\
			margin: 7px;	\
			width: 21px;height: 21px;	\
			border: 1px #c9def2 solid;	\
			border-radius: 3px;	\
			background: transparent center center no-repeat; \
			background-image: ' + this.searchButtonIcon + '; \
			} ');
		RESUtils.addCSS('li:hover > #RESSearchMenuItem { \
			border-color: #369;	\
			background-image: ' + this.searchButtonIconHover + '; \
			}');
	},
	go: function() {
		RESUtils.addCSS(modules['settingsNavigation'].css);
		this.menuItem = RESUtils.createElementWithID('i', 'RESSearchMenuItem');
		this.menuItem.setAttribute('title', 'search settings');
		this.menuItem.addEventListener('click', function(e) {
			modules['settingsNavigation'].showSearch()
		}, false);
		RESConsole.settingsButton.appendChild(this.menuItem);

		if (!(this.isEnabled() && this.isMatchURL())) return;

		window.addEventListener('hashchange', modules['settingsNavigation'].onHashChange);
		window.addEventListener('popstate', modules['settingsNavigation'].onPopState);
		setTimeout(modules['settingsNavigation'].onHashChange, 300); // for initial pageload; wait until after RES has completed loading

		this.consoleTip();
	},
	searchButtonIcon: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAEJGlDQ1BJQ0MgUHJvZmlsZQAAOBGFVd9v21QUPolvUqQWPyBYR4eKxa9VU1u5GxqtxgZJk6XtShal6dgqJOQ6N4mpGwfb6baqT3uBNwb8AUDZAw9IPCENBmJ72fbAtElThyqqSUh76MQPISbtBVXhu3ZiJ1PEXPX6yznfOec7517bRD1fabWaGVWIlquunc8klZOnFpSeTYrSs9RLA9Sr6U4tkcvNEi7BFffO6+EdigjL7ZHu/k72I796i9zRiSJPwG4VHX0Z+AxRzNRrtksUvwf7+Gm3BtzzHPDTNgQCqwKXfZwSeNHHJz1OIT8JjtAq6xWtCLwGPLzYZi+3YV8DGMiT4VVuG7oiZpGzrZJhcs/hL49xtzH/Dy6bdfTsXYNY+5yluWO4D4neK/ZUvok/17X0HPBLsF+vuUlhfwX4j/rSfAJ4H1H0qZJ9dN7nR19frRTeBt4Fe9FwpwtN+2p1MXscGLHR9SXrmMgjONd1ZxKzpBeA71b4tNhj6JGoyFNp4GHgwUp9qplfmnFW5oTdy7NamcwCI49kv6fN5IAHgD+0rbyoBc3SOjczohbyS1drbq6pQdqumllRC/0ymTtej8gpbbuVwpQfyw66dqEZyxZKxtHpJn+tZnpnEdrYBbueF9qQn93S7HQGGHnYP7w6L+YGHNtd1FJitqPAR+hERCNOFi1i1alKO6RQnjKUxL1GNjwlMsiEhcPLYTEiT9ISbN15OY/jx4SMshe9LaJRpTvHr3C/ybFYP1PZAfwfYrPsMBtnE6SwN9ib7AhLwTrBDgUKcm06FSrTfSj187xPdVQWOk5Q8vxAfSiIUc7Z7xr6zY/+hpqwSyv0I0/QMTRb7RMgBxNodTfSPqdraz/sDjzKBrv4zu2+a2t0/HHzjd2Lbcc2sG7GtsL42K+xLfxtUgI7YHqKlqHK8HbCCXgjHT1cAdMlDetv4FnQ2lLasaOl6vmB0CMmwT/IPszSueHQqv6i/qluqF+oF9TfO2qEGTumJH0qfSv9KH0nfS/9TIp0Wboi/SRdlb6RLgU5u++9nyXYe69fYRPdil1o1WufNSdTTsp75BfllPy8/LI8G7AUuV8ek6fkvfDsCfbNDP0dvRh0CrNqTbV7LfEEGDQPJQadBtfGVMWEq3QWWdufk6ZSNsjG2PQjp3ZcnOWWing6noonSInvi0/Ex+IzAreevPhe+CawpgP1/pMTMDo64G0sTCXIM+KdOnFWRfQKdJvQzV1+Bt8OokmrdtY2yhVX2a+qrykJfMq4Ml3VR4cVzTQVz+UoNne4vcKLoyS+gyKO6EHe+75Fdt0Mbe5bRIf/wjvrVmhbqBN97RD1vxrahvBOfOYzoosH9bq94uejSOQGkVM6sN/7HelL4t10t9F4gPdVzydEOx83Gv+uNxo7XyL/FtFl8z9ZAHF4bBsrEwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAONJREFUOBGlkz0KwkAQRo2ICt5IsBE9gI1dwAOk8AqCgufQPo2CYGlhIVh4Aj2ClYVg4hvdCclmI8gOPHbn78vsLgnSNK35WN2nWXq9BRoVEwyIj6ANO4ghgbLJHVjM8BM4wwGesIYm2LU1O9ClSCwCzfXZi8gkF9NcSWBB0dVRGBPbOOLOSww4qJA38d3vbanqEabEA5Mbsj4gNH42vvgFxxTIJYpd4AgvcbAVdKDQ8/lKflaz12ds4e+hBxFsIYQ7fM1W/OHPyYktIZuiagLVt9cxgRucNPGvgPZlq/e/4C3wBoAXSrzY2Qd2AAAAAElFTkSuQmCC')",
	searchButtonIconHover: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAEJGlDQ1BJQ0MgUHJvZmlsZQAAOBGFVd9v21QUPolvUqQWPyBYR4eKxa9VU1u5GxqtxgZJk6XtShal6dgqJOQ6N4mpGwfb6baqT3uBNwb8AUDZAw9IPCENBmJ72fbAtElThyqqSUh76MQPISbtBVXhu3ZiJ1PEXPX6yznfOec7517bRD1fabWaGVWIlquunc8klZOnFpSeTYrSs9RLA9Sr6U4tkcvNEi7BFffO6+EdigjL7ZHu/k72I796i9zRiSJPwG4VHX0Z+AxRzNRrtksUvwf7+Gm3BtzzHPDTNgQCqwKXfZwSeNHHJz1OIT8JjtAq6xWtCLwGPLzYZi+3YV8DGMiT4VVuG7oiZpGzrZJhcs/hL49xtzH/Dy6bdfTsXYNY+5yluWO4D4neK/ZUvok/17X0HPBLsF+vuUlhfwX4j/rSfAJ4H1H0qZJ9dN7nR19frRTeBt4Fe9FwpwtN+2p1MXscGLHR9SXrmMgjONd1ZxKzpBeA71b4tNhj6JGoyFNp4GHgwUp9qplfmnFW5oTdy7NamcwCI49kv6fN5IAHgD+0rbyoBc3SOjczohbyS1drbq6pQdqumllRC/0ymTtej8gpbbuVwpQfyw66dqEZyxZKxtHpJn+tZnpnEdrYBbueF9qQn93S7HQGGHnYP7w6L+YGHNtd1FJitqPAR+hERCNOFi1i1alKO6RQnjKUxL1GNjwlMsiEhcPLYTEiT9ISbN15OY/jx4SMshe9LaJRpTvHr3C/ybFYP1PZAfwfYrPsMBtnE6SwN9ib7AhLwTrBDgUKcm06FSrTfSj187xPdVQWOk5Q8vxAfSiIUc7Z7xr6zY/+hpqwSyv0I0/QMTRb7RMgBxNodTfSPqdraz/sDjzKBrv4zu2+a2t0/HHzjd2Lbcc2sG7GtsL42K+xLfxtUgI7YHqKlqHK8HbCCXgjHT1cAdMlDetv4FnQ2lLasaOl6vmB0CMmwT/IPszSueHQqv6i/qluqF+oF9TfO2qEGTumJH0qfSv9KH0nfS/9TIp0Wboi/SRdlb6RLgU5u++9nyXYe69fYRPdil1o1WufNSdTTsp75BfllPy8/LI8G7AUuV8ek6fkvfDsCfbNDP0dvRh0CrNqTbV7LfEEGDQPJQadBtfGVMWEq3QWWdufk6ZSNsjG2PQjp3ZcnOWWing6noonSInvi0/Ex+IzAreevPhe+CawpgP1/pMTMDo64G0sTCXIM+KdOnFWRfQKdJvQzV1+Bt8OokmrdtY2yhVX2a+qrykJfMq4Ml3VR4cVzTQVz+UoNne4vcKLoyS+gyKO6EHe+75Fdt0Mbe5bRIf/wjvrVmhbqBN97RD1vxrahvBOfOYzoosH9bq94uejSOQGkVM6sN/7HelL4t10t9F4gPdVzydEOx83Gv+uNxo7XyL/FtFl8z9ZAHF4bBsrEwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAPBJREFUOBGlkTEKAjEQRTciIth4HkvRA9jYCR7AwisICvZiZ6X9NlvYW1gIFp5AT2Eh6PpGMjLuBkUy8JmZ5P+fZOLyPE9iohIjFm20QTV0A+dch/UeqIMtSHnqg1wOmYEFjAkQ8hHswA1sQM3ytC6KWxBlqqM3IUna9GIy1DWbiwYziGdLkJpIQVZclz40REbgnKhMSB/+b+sKSZ8wpnb+9C71FQwsV+uPJ3iBDFFOO4E9uPt+TW6oUHPJwJvINy7BCvTBAohpBpoqfnFt861GOPUmc8vTd7L3O5it3OaCwUHZfxmoyObQN9r9n3W0wRPmWv0jZnGemgAAAABJRU5ErkJggg==')",
	consoleTip: function() {
		// first, ensure that we've at least run dailyTip once (so RES first-run has happened)...
		var lastToolTip = RESStorage.getItem('RESLastToolTip');
		if (lastToolTip) {
			// if yes, see if the user has ever opened the settings console.
			var hasOpenedConsole = RESStorage.getItem('RESConsole.hasOpenedConsole');
			if (!hasOpenedConsole) {
				// if no, nag them once daily that the console exists until they use it.  Once it's been opened, this check will never run again.
				var lastCheckDailyTip = parseInt(RESStorage.getItem('RESLastToolTip'), 10) || 0;
				var now = Date.now();
				// 86400000 = 1 day - remind users once a day if they've never opened the settings that they should check out the console sometime...
				var lastCheck = parseInt(RESStorage.getItem('RESConsole.hasOpenedCheck'), 10) || 0;
				if (((now - lastCheckDailyTip) > 1000) && ((now - lastCheck) > 86400000)) {
					RESStorage.setItem('RESConsole.hasOpenedCheck', now);
					modules['RESTips'].showTip(0, 'console');
				}
			}
		}
	},
	makeUrlHashLink: function(moduleID, optionKey, displayText, cssClass) {
		if (!displayText) {
			if (optionKey) {
				displayText = optionKey;
			} else if (modules[moduleID]) {
				displayText = modules[moduleID].moduleName;
			} else if (moduleID) {
				displayText = moduleID;
			} else {
				displayText = 'Settings';
			}
		}

		var hash = modules['settingsNavigation'].makeUrlHash(moduleID, optionKey);
		var link = ['<a ', 'class="', cssClass || '', '" ', 'href="', hash, '"', '>', displayText, '</a>'].join('');
		return link;
	},
	makeUrlHash: function(moduleID, optionKey) {
		var hashComponents = ['#!settings']

		if (moduleID) {
			hashComponents.push(moduleID);
		}

		if (moduleID && optionKey) {
			hashComponents.push(optionKey);
		}

		var hash = hashComponents.join('/');
		return hash;
	},
	setUrlHash: function(moduleID, optionKey) {
		var titleComponents = ['RES Settings'];

		if (moduleID) {
			var module = modules[moduleID];
			var moduleName = module && module.moduleName || moduleID;
			titleComponents.push(moduleName);

			if (optionKey) {
				titleComponents.push(optionKey);
			}
		}

		var hash = this.makeUrlHash(moduleID, optionKey);
		var title = titleComponents.join(' - ');

		if (window.location.hash != hash) {
			window.history.pushState(hash, title, hash);
		}
	},
	resetUrlHash: function() {
		window.location.hash = "";
	},
	onHashChange: function(event) {
		var hash = window.location.hash;
		if (hash.substring(0, 10) !== '#!settings') return;

		var params = hash.match(/\/[\w\s]+/g);
		if (params && params[0]) {
			var moduleID = params[0].substring(1);
		}
		if (params && params[1]) {
			var optionKey = params[1].substring(1);
		}

		modules['settingsNavigation'].loadSettingsPage(moduleID, optionKey);
	},
	onPopState: function(event) {
		var state = typeof event.state === "string" && event.state.split('/');
		if (!state || state[0] !== '#!settings') {
			if (RESConsole.isOpen) {
				RESConsole.close();
			}
			return;
		}

		var moduleID = state[1];
		var optionKey = state[2];

		modules['settingsNavigation'].loadSettingsPage(moduleID, optionKey);
	},
	loadSettingsPage: function(moduleID, optionKey, optionValue) {
		if (moduleID && modules.hasOwnProperty(moduleID)) {
			var module = modules[moduleID];
		}
		if (module) {
			var category = module.category;
		}


		RESConsole.open(module && module.moduleID);
		if (module) {
			if (optionKey && module.options.hasOwnProperty(optionKey)) {
				var optionsPanel = $(RESConsole.RESConsoleContent);
				var optionElement = optionsPanel.find('label[for="' + optionKey + '"]');
				var optionParent = optionElement.parent();
				optionParent.addClass('highlight');
				if (optionElement.length) {
					var configPanel = $(RESConsole.RESConsoleConfigPanel);
					var offset = optionElement.offset().top - configPanel.offset().top;
					optionsPanel.scrollTop(offset);
				}
			}
		} else {
			switch (moduleID) {
				case 'search':
					this.search(optionKey);
					break;
				default:
					break;
			}
		}
	},
	search: function(query) {
		RESConsole.openCategoryPanel('About RES');
		modules['settingsNavigation'].drawSearchResults(query);
		modules['settingsNavigation'].getSearchResults(query);
		modules['settingsNavigation'].setUrlHash('search', query);
	},
	showSearch: function() {
		RESConsole.hidePrefsDropdown();
		modules['settingsNavigation'].drawSearchResults();
		$('#SearchRES-input').focus();
	},
	doneSearch: function(query, results) {
		modules['settingsNavigation'].drawSearchResults(query, results);
	},
	getSearchResults: function(query) {
		if (!(query && query.toString().length)) {
			modules['settingsNavigation'].doneSearch(query, []);
		}

		var queryTerms = modules['settingsNavigation'].prepareSearchText(query, true).split(' ');
		var results = [];

		// Search options
		for (var moduleKey in modules) {
			if (!modules.hasOwnProperty(moduleKey)) continue;
			var module = modules[moduleKey];


			var searchString = module.moduleID + module.moduleName + module.category + module.description;
			searchString = modules['settingsNavigation'].prepareSearchText(searchString, false);
			var matches = modules['settingsNavigation'].searchMatches(queryTerms, searchString);
			if (matches) {
				var result = modules['settingsNavigation'].makeModuleSearchResult(moduleKey);
				result.rank = matches;
				results.push(result);
			}


			var options = module.options;

			for (var optionKey in options) {
				if (!options.hasOwnProperty(optionKey)) continue;
				var option = options[optionKey];

				var searchString = module.moduleID + module.moduleName + module.category + optionKey + option.description;
				searchString = modules['settingsNavigation'].prepareSearchText(searchString, false);
				var matches = modules['settingsNavigation'].searchMatches(queryTerms, searchString);
				if (matches) {
					var result = modules['settingsNavigation'].makeOptionSearchResult(moduleKey, optionKey);
					result.rank = matches;
					results.push(result);
				}
			}
		}

		results.sort(function(a, b) {
			var comparison = b.rank - a.rank;

			/*
			if (comparison === 0) {
				comparison = 
					a.title < b.title ? -1
				 	: a.title > b.title ? 1
				 	: 0;

			}

			if (comparison === 0) {
				comparison = 
					a.description < b.description ? -1
				 	: a.description > b.description ? 1
				 	: 0;
			}
			*/

			return comparison;
		});

		modules['settingsNavigation'].doneSearch(query, results);

	},
	searchMatches: function(needles, haystack) {
		if (!(haystack && haystack.length))
			return false;

		var numMatches = 0;
		for (var i = 0; i < needles.length; i++) {
			if (haystack.indexOf(needles[i]) !== -1)
				numMatches++;
		}

		return numMatches;
	},
	prepareSearchText: function(text, preserveSpaces) {
		if (typeof text === "undefined" || text === null) {
			return '';
		}

		var replaceSpacesWith = !! preserveSpaces ? ' ' : ''
		return text.toString().toLowerCase()
			.replace(/[,\/]/g, replaceSpacesWith).replace(/\s+/g, replaceSpacesWith);
	},
	makeOptionSearchResult: function(moduleKey, optionKey) {
		var module = modules[moduleKey];
		var option = module.options[optionKey];

		var result = {};
		result.type = 'option';
		result.breadcrumb = ['Settings',
			module.category,
			module.moduleName + ' (' + module.moduleID + ')'
		].join(' > ');
		result.title = optionKey;
		result.description = option.description;
		result.moduleID = moduleKey;
		result.optionKey = optionKey;

		return result;
	},
	makeModuleSearchResult: function(moduleKey) {
		var module = modules[moduleKey];

		var result = {};
		result.type = 'module';
		result.breadcrumb = ['Settings',
			module.category,
			'(' + module.moduleID + ')'
		].join(' > ');
		result.title = module.moduleName;
		result.description = module.description;
		result.moduleID = moduleKey;

		return result;
	},

	onSearchResultSelected: function(result) {
		if (!result) return;

		switch (result.type) {
			case 'module':
				modules['settingsNavigation'].loadSettingsPage(result.moduleID);
				break;
			case 'option':
				modules['settingsNavigation'].loadSettingsPage(result.moduleID, result.optionKey);
				break;
			default:
				alert('Could not load search result');
				break;
		}
	},
	// ---------- View ------
	css: '\
		#SearchRES #SearchRES-results-container { \
			display: none; \
		} \
		#SearchRES #SearchRES-results-container + #SearchRES-boilerplate { margin-top: 1em; border-top: 1px black solid; padding-top: 1em; }	\
		#SearchRES h4 { \
			margin-top: 1.5em; \
		} \
		#SearchRES-results { \
		} \
		#SearchRES-results li { \
			list-style-type: none; \
			border-bottom: 1px dashed #ccc; \
			cursor: pointer; \
			margin-left: 0px; \
			padding-left: 10px; \
			padding-top: 24px; \
			padding-bottom: 24px; \
		} \
		#SearchRES-results li:hover { \
			background-color: #FAFAFF; \
		} \
		.SearchRES-result-title { \
			margin-bottom: 12px; \
			font-weight: bold; \
			color: #666; \
		} \
		.SearchRES-breadcrumb { \
			font-weight: normal; \
			color: #888; \
		} \
		.SearchRES-result-copybutton {\
			float: right; \
			opacity: 0.4; \
			padding: 10px; \
			width: 26px; \
			height: 22px; \
			background: no-repeat center center; \
			background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAWCAYAAADeiIy1AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA+5pVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ1dWlkOjY1RTYzOTA2ODZDRjExREJBNkUyRDg4N0NFQUNCNDA3IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkUwRjM3M0QxMDY5NTExRTI5OUZEQTZGODg4RDc1ODdCIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkUwRjM3M0QwMDY5NTExRTI5OUZEQTZGODg4RDc1ODdCIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowMTgwMTE3NDA3MjA2ODExODA4M0ZFMkJBM0M1RUU2NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowNjgwMTE3NDA3MjA2ODExODA4M0U3NkRBMDNEMDVDMSIvPiA8ZGM6dGl0bGU+IDxyZGY6QWx0PiA8cmRmOmxpIHhtbDpsYW5nPSJ4LWRlZmF1bHQiPmdseXBoaWNvbnM8L3JkZjpsaT4gPC9yZGY6QWx0PiA8L2RjOnRpdGxlPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pn00ay4AAAEISURBVHjavJWBDYQgDEXhcgMwwm2gIzgCIzjCjeAIjsAIN8KN4Ai6wW3AtTm4EChYkdjkm2javLa2IKy1olZgL9CD5XsShI8PSF8B8pqvAqEWUJ8FYemglQhEmfg/gA0uhvLHVo5EUtmAf3ZgCoNB74xvLkEVgnwlJtOep8vSVihM9veRAKiDFdhCK/VdECal9JBONLSkIhzVBpWUW4cT1giSDEMMmqP+GjdxA2OPiuMdgxb3bQozOr2wBMhSGTFAppQYBZoqDtWR4ZuA1MFromf60gt7AKZyp0oo6UD4ImuWEJYbB6Dbi28BYsXfQJsLMBUQH7Nx/HWDU4B3le9cfCWtHAjqK8AAypyhqqqagq4AAAAASUVORK5CYII="); \
			display: none; \
		} \
		#SearchRES-results li:hover .SearchRES-result-copybutton { display: block; } \
		#SearchRES-input-submit { \
			margin-left: 8px; \
		} \
		#SearchRES-input { \
			width: 200px; \
			height: 22px; \
			font-size: 14px; \
		} \
		#SearchRES-input-container { \
			float: left; \
			margin-left: 3em; \
			margin-top: 7px; \
		} \
 	',
	searchPanelHtml: '\
		<h3>Search RES Settings Console</h3> \
		<div id="SearchRES-results-container"> \
			<h4>Results for: <span id="SearchRES-query"></span></h4> \
			<ul id="SearchRES-results"></ul> \
			<p id="SearchRES-results-none">No results found</p> \
		</div> \
		<div id="SearchRES-boilerplate"> \
			<p>You can search for RES options by module name, option name, and description. For example, try searching for "daily trick" in one of the following ways:</p> \
			<ul> \
				<li>type <code>daily trick</code> in the search box above and click the button</li> \
				<li>press <code>.</code> to open the RES console, type in <code>search <em>daily trick</em></code>, and press Enter</li> \
			</ul> \
		</div> \
	',
	searchPanel: null,
	renderSearchPanel: function() {
		var searchPanel = $('<div />').html(modules['settingsNavigation'].searchPanelHtml);
		searchPanel.on('click', '#SearchRES-results-container .SearchRES-result-item', modules['settingsNavigation'].handleSearchResultClick);

		modules['settingsNavigation'].searchPanel = searchPanel;
		return searchPanel;
	},
	searchForm: null,
	renderSearchForm: function() {
		var RESSearchContainer = RESUtils.createElementWithID('form', 'SearchRES-input-container');

		var RESSearchBox = RESUtils.createElementWithID('input', 'SearchRES-input');
		RESSearchBox.setAttribute('type', 'text');
		RESSearchBox.setAttribute('placeholder', 'search RES settings');

		var RESSearchButton = RESUtils.createElementWithID('input', 'SearchRES-input-submit');
		RESSearchButton.classList.add('blueButton');
		RESSearchButton.setAttribute('type', 'submit');
		RESSearchButton.setAttribute('value', 'search');

		RESSearchContainer.appendChild(RESSearchBox);
		RESSearchContainer.appendChild(RESSearchButton);

		RESSearchContainer.addEventListener('submit', function(e) {
			e.preventDefault();
			modules['settingsNavigation'].search(RESSearchBox.value);

			return false;
		});

		searchForm = RESSearchContainer;
		return RESSearchContainer;
	},
	drawSearchResultsPage: function() {
		if (!RESConsole.isOpen) {
			RESConsole.open();
		}

		if (!$('#SearchRES').is(':visible')) {
			RESConsole.openCategoryPanel('About RES');

			// Open "Search RES" page
			$('#Button-SearchRES', this.RESConsoleContent).trigger('click', {
				duration: 0
			});
		}
	},
	drawSearchResults: function(query, results) {
		modules['settingsNavigation'].drawSearchResultsPage();

		var resultsContainer = $('#SearchRES-results-container', modules['settingsNavigation'].searchPanel);

		if (!(query && query.length)) {
			resultsContainer.hide();
			return;
		}

		resultsContainer.show();
		resultsContainer.find('#SearchRES-query').text(query);
		$("#SearchRES-input", modules['settingsNavigation'].searchForm).val(query);

		if (!(results && results.length)) {
			resultsContainer.find('#SearchRES-results-none').show();
			resultsContainer.find('#SearchRES-results').hide();
		} else {
			resultsContainer.find('#SearchRES-results-none').hide();
			var resultsList = $('#SearchRES-results', resultsContainer).show();

			resultsList.empty();
			for (var i = 0; i < results.length; i++) {
				var result = results[i];

				var element = modules['settingsNavigation'].drawSearchResultItem(result);
				resultsList.append(element);
			}
		}
	},
	drawSearchResultItem: function(result) {
		var element = $('<li>');
		element.addClass('SearchRES-result-item')
			.data('SearchRES-result', result);

		$('<span>', {
			class: 'SearchRES-result-copybutton'
		})
			.appendTo(element)
			.attr('title', 'copy this for a comment');

		var breadcrumb = $('<span>', {
			class: 'SearchRES-breadcrumb'
		})
			.text(result.breadcrumb + ' > ');

		$('<div>', {
			class: 'SearchRES-result-title'
		})
			.append(breadcrumb)
			.append(result.title)
			.appendTo(element);

		$('<div>', {
			class: 'SearchRES-result-description'
		})
			.appendTo(element)
			.html(result.description);

		return element;
	},
	handleSearchResultClick: function(e) {
		var element = $(this);
		var result = element.data('SearchRES-result');
		if ($(e.target).is('.SearchRES-result-copybutton')) {
			modules['settingsNavigation'].onSearchResultCopy(result, element);
		} else {
			modules['settingsNavigation'].onSearchResultSelected(result);
		}
		e.preventDefault();
	},
	onSearchResultCopy: function(result, element) {
		var markdown = modules['settingsNavigation'].makeOptionSearchResultLink(result);
		alert('<textarea rows="5" cols="50">' + markdown + '</textarea>');
	},
	makeOptionSearchResultLink: function(result) {
		var url = document.location.pathname +
			modules['settingsNavigation'].makeUrlHash(result.moduleID, result.optionKey);

		var text = [
			result.breadcrumb,
			'[' + result.title + '](' + url + ')',
			'  \n',
			result.description,
			'  \n',
			'  \n'
		].join(' ');
		return text;
	}
};

modules['dashboard'] = {
	moduleID: 'dashboard',
	moduleName: 'RES Dashboard',
	category: 'UI',
	options: {
		defaultPosts: {
			type: 'text',
			value: 3,
			description: 'Number of posts to show by default in each widget'
		},
		defaultSort: {
			type: 'enum',
			values: [{
				name: 'hot',
				value: 'hot'
			}, {
				name: 'new',
				value: 'new'
			}, {
				name: 'controversial',
				value: 'controversial'
			}, {
				name: 'top',
				value: 'top'
			}],
			value: 'hot',
			description: 'Default sort method for new widgets'
		},
		dashboardShortcut: {
			type: 'boolean',
			value: true,
			description: 'Show +dashboard shortcut in sidebar for easy addition of dashboard widgets.'
		},
		tagsPerPage: {
			type: 'text',
			value: 25,
			description: 'How many user tags to show per page. (enter zero to show all on one page)'
		}
	},
	description: 'The RES Dashboard is home to a number of features including widgets and other useful tools',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([-\w\.]+\.)?reddit\.com\/[-\w\.\/]*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if (this.isEnabled()) {
			this.getLatestWidgets();
			RESUtils.addCSS('.RESDashboardToggle { margin-right: 5px; color: white; background-image: url(https://redditstatic.s3.amazonaws.com/bg-button-add.png); cursor: pointer; text-align: center; width: 68px; font-weight: bold; font-size: 10px; border: 1px solid #444; padding: 1px 6px; border-radius: 3px 3px 3px 3px;  }');
			RESUtils.addCSS('.RESDashboardToggle.remove { background-image: url(https://redditstatic.s3.amazonaws.com/bg-button-remove.png) }');
			if (this.isMatchURL()) {
				$('#RESDropdownOptions').prepend('<li id="DashboardLink"><a href="/r/Dashboard">my dashboard</a></li>');
				if (RESUtils.currentSubreddit()) {
					RESUtils.addCSS('.RESDashboardToggle {}');
					// one more safety check... not sure how people's widgets[] arrays are breaking.
					if (!(this.widgets instanceof Array)) {
						this.widgets = [];
					}
					if (RESUtils.currentSubreddit('dashboard')) {
						$('#noresults, #header-bottom-left .tabmenu:not(".viewimages")').hide();
						$('#header-bottom-left .redditname a:first').text('My Dashboard');
						this.drawDashboard();
					}
					if (this.options.dashboardShortcut.value == true) this.addDashboardShortcuts();
				}
			}
		}
	},
	getLatestWidgets: function() {
		try {
			this.widgets = JSON.parse(RESStorage.getItem('RESmodules.dashboard.' + RESUtils.loggedInUser())) || [];
		} catch (e) {
			this.widgets = [];
		}
	},
	loader: 'data:image/gif;base64,R0lGODlhEAAQAPQAAP///2+NyPb3+7zK5e3w95as1rPD4W+NyKC02oOdz8/Z7Nnh8HqVzMbS6XGOyI2l06m73gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAAFdyAgAgIJIeWoAkRCCMdBkKtIHIngyMKsErPBYbADpkSCwhDmQCBethRB6Vj4kFCkQPG4IlWDgrNRIwnO4UKBXDufzQvDMaoSDBgFb886MiQadgNABAokfCwzBA8LCg0Egl8jAggGAA1kBIA1BAYzlyILczULC2UhACH5BAkKAAAALAAAAAAQABAAAAV2ICACAmlAZTmOREEIyUEQjLKKxPHADhEvqxlgcGgkGI1DYSVAIAWMx+lwSKkICJ0QsHi9RgKBwnVTiRQQgwF4I4UFDQQEwi6/3YSGWRRmjhEETAJfIgMFCnAKM0KDV4EEEAQLiF18TAYNXDaSe3x6mjidN1s3IQAh+QQJCgAAACwAAAAAEAAQAAAFeCAgAgLZDGU5jgRECEUiCI+yioSDwDJyLKsXoHFQxBSHAoAAFBhqtMJg8DgQBgfrEsJAEAg4YhZIEiwgKtHiMBgtpg3wbUZXGO7kOb1MUKRFMysCChAoggJCIg0GC2aNe4gqQldfL4l/Ag1AXySJgn5LcoE3QXI3IQAh+QQJCgAAACwAAAAAEAAQAAAFdiAgAgLZNGU5joQhCEjxIssqEo8bC9BRjy9Ag7GILQ4QEoE0gBAEBcOpcBA0DoxSK/e8LRIHn+i1cK0IyKdg0VAoljYIg+GgnRrwVS/8IAkICyosBIQpBAMoKy9dImxPhS+GKkFrkX+TigtLlIyKXUF+NjagNiEAIfkECQoAAAAsAAAAABAAEAAABWwgIAICaRhlOY4EIgjH8R7LKhKHGwsMvb4AAy3WODBIBBKCsYA9TjuhDNDKEVSERezQEL0WrhXucRUQGuik7bFlngzqVW9LMl9XWvLdjFaJtDFqZ1cEZUB0dUgvL3dgP4WJZn4jkomWNpSTIyEAIfkECQoAAAAsAAAAABAAEAAABX4gIAICuSxlOY6CIgiD8RrEKgqGOwxwUrMlAoSwIzAGpJpgoSDAGifDY5kopBYDlEpAQBwevxfBtRIUGi8xwWkDNBCIwmC9Vq0aiQQDQuK+VgQPDXV9hCJjBwcFYU5pLwwHXQcMKSmNLQcIAExlbH8JBwttaX0ABAcNbWVbKyEAIfkECQoAAAAsAAAAABAAEAAABXkgIAICSRBlOY7CIghN8zbEKsKoIjdFzZaEgUBHKChMJtRwcWpAWoWnifm6ESAMhO8lQK0EEAV3rFopIBCEcGwDKAqPh4HUrY4ICHH1dSoTFgcHUiZjBhAJB2AHDykpKAwHAwdzf19KkASIPl9cDgcnDkdtNwiMJCshACH5BAkKAAAALAAAAAAQABAAAAV3ICACAkkQZTmOAiosiyAoxCq+KPxCNVsSMRgBsiClWrLTSWFoIQZHl6pleBh6suxKMIhlvzbAwkBWfFWrBQTxNLq2RG2yhSUkDs2b63AYDAoJXAcFRwADeAkJDX0AQCsEfAQMDAIPBz0rCgcxky0JRWE1AmwpKyEAIfkECQoAAAAsAAAAABAAEAAABXkgIAICKZzkqJ4nQZxLqZKv4NqNLKK2/Q4Ek4lFXChsg5ypJjs1II3gEDUSRInEGYAw6B6zM4JhrDAtEosVkLUtHA7RHaHAGJQEjsODcEg0FBAFVgkQJQ1pAwcDDw8KcFtSInwJAowCCA6RIwqZAgkPNgVpWndjdyohACH5BAkKAAAALAAAAAAQABAAAAV5ICACAimc5KieLEuUKvm2xAKLqDCfC2GaO9eL0LABWTiBYmA06W6kHgvCqEJiAIJiu3gcvgUsscHUERm+kaCxyxa+zRPk0SgJEgfIvbAdIAQLCAYlCj4DBw0IBQsMCjIqBAcPAooCBg9pKgsJLwUFOhCZKyQDA3YqIQAh+QQJCgAAACwAAAAAEAAQAAAFdSAgAgIpnOSonmxbqiThCrJKEHFbo8JxDDOZYFFb+A41E4H4OhkOipXwBElYITDAckFEOBgMQ3arkMkUBdxIUGZpEb7kaQBRlASPg0FQQHAbEEMGDSVEAA1QBhAED1E0NgwFAooCDWljaQIQCE5qMHcNhCkjIQAh+QQJCgAAACwAAAAAEAAQAAAFeSAgAgIpnOSoLgxxvqgKLEcCC65KEAByKK8cSpA4DAiHQ/DkKhGKh4ZCtCyZGo6F6iYYPAqFgYy02xkSaLEMV34tELyRYNEsCQyHlvWkGCzsPgMCEAY7Cg04Uk48LAsDhRA8MVQPEF0GAgqYYwSRlycNcWskCkApIyEAOwAAAAAAAAAAAA==',
	drawDashboard: function() {
		// this first line hides the "you need RES 4.0+ to view the dashboard" link
		RESUtils.addCSS('.id-t3_qi5iy {display: none;}');
		RESUtils.addCSS('.RESDashboardComponent { position: relative; border: 1px solid #ccc; border-radius: 3px 3px 3px 3px; overflow: hidden; margin-bottom: 10px; }');
		RESUtils.addCSS('.RESDashboardComponentHeader { box-sizing: border-box; padding: 5px 0 8px 0; background-color: #f0f3fc; overflow: hidden; }');
		RESUtils.addCSS('.RESDashboardComponentScrim { position: absolute; top: 0; bottom: 0; left: 0; right: 0; z-index: 5; display: none; }');
		RESUtils.addCSS('.RESDashboardComponentLoader { box-sizing: border-box; position: absolute; background-color: #f2f9ff; border: 1px solid #b9d7f4; border-radius: 3px 3px 3px 3px; width: 314px; height: 40px; left: 50%; top: 50%; margin-left: -167px; margin-top: -20px; text-align: center; padding-top: 11px; }');
		RESUtils.addCSS('.RESDashboardComponentLoader span { position: relative; top: -6px; left: 5px; } ');
		RESUtils.addCSS('.RESDashboardComponentContainer { padding: 10px 15px 0 15px; min-height: 100px; }');
		RESUtils.addCSS('.RESDashboardComponentContainer.minimized { display: none; }');
		RESUtils.addCSS('.RESDashboardComponent a.widgetPath, .addNewWidget, .editWidget { display: inline-block; margin-left: 0; margin-top: 7px; color: #000; font-weight: bold; }');
		RESUtils.addCSS('.editWidget { float: left; margin-right: 10px; } ');
		RESUtils.addCSS('.RESDashboardComponent a.widgetPath { margin-left: 15px; vertical-align: top; width: 120px; overflow: hidden; text-overflow: ellipsis; }');
		RESUtils.addCSS('#RESDashboardAddComponent, #RESDashboardEditComponent { box-sizing: border-box; padding: 5px 8px 5px 8px; vertical-align: middle; background-color: #cee3f8; border: 1px solid #369;}');
		RESUtils.addCSS('#RESDashboardEditComponent { display: none; position: absolute; }');
		// RESUtils.addCSS('#RESDashboardComponentScrim, #RESDashboardComponentLoader { background-color: #ccc; opacity: 0.3; border: 1px solid red; display: none; }');
		RESUtils.addCSS('#addRedditFormContainer, #addMailWidgetContainer, #addUserFormContainer { display: none; }');
		RESUtils.addCSS('#addWidgetButtons, #addRedditFormContainer, #addMailWidgetContainer, #addUserFormContainer, #editRedditFormContainer { width: auto; min-width: 550px; height: 28px; float: right; text-align: right; }');
		RESUtils.addCSS('#editRedditFormContainer { width: auto; }');
		RESUtils.addCSS('#addUserForm, #addRedditForm { display: inline-block }');
		RESUtils.addCSS('#addUser { width: 200px; height: 24px; }');
		RESUtils.addCSS('#addRedditFormContainer ul.token-input-list-facebook, #editRedditFormContainer ul.token-input-list-facebook { float: left; }');
		RESUtils.addCSS('#addReddit { width: 115px; background-color: #fff; border: 1px solid #96bfe8; margin-left: 6px; margin-right: 6px; padding: 1px 2px 1px 2px; }');
		RESUtils.addCSS('#addRedditDisplayName, #editRedditDisplayName { width: 140px; height: 24px; background-color: #fff; border: 1px solid #96bfe8; margin-left: 6px; margin-right: 6px; padding: 1px 2px 1px 2px; }');
		RESUtils.addCSS('#editReddit { width: 5px; } ');
		RESUtils.addCSS('.addButton, .updateButton { cursor: pointer; display: inline-block; width: auto; padding: 3px 5px; font-size: 11px; color: #fff; border: 1px solid #636363; border-radius: 3px; background-color: #5cc410; margin-top: 3px; margin-left: 5px; }');
		RESUtils.addCSS('.cancelButton { width: 50px; text-align: center; cursor: pointer; display: inline-block; padding: 3px 5px; font-size: 11px; color: #fff; border: 1px solid #636363; border-radius: 3px; background-color: #D02020; margin-top: 3px; margin-left: 5px; }');
		RESUtils.addCSS('.backToWidgetTypes { display: inline-block; vertical-align: top; margin-top: 8px; font-weight: bold; color: #000; cursor: pointer; }');
		RESUtils.addCSS('.RESDashboardComponentHeader ul { font-family: Verdana; font-size: 13px; box-sizing: border-box; line-height: 22px; display: inline-block; margin-top: 2px; }');
		RESUtils.addCSS('.RESDashboardComponentHeader ul li { box-sizing: border-box; vertical-align: middle; height: 24px; display: inline-block; cursor: pointer; padding: 0 6px; border: 1px solid #c7c7c7; background-color: #fff; color: #6c6c6c; border-radius: 3px 3px 3px 3px; }');
		RESUtils.addCSS('.RESDashboardComponentHeader .editButton { display: inline-block; padding: 0; width: 24px; -moz-box-sizing: border-box; vertical-align: middle; margin-left: 10px; } ');
		RESUtils.addCSS('.RESDashboardComponent.minimized ul li { display: none; }');
		RESUtils.addCSS('.RESDashboardComponent.minimized li.RESClose, .RESDashboardComponent.minimized li.minimize { display: inline-block; }');
		RESUtils.addCSS('ul.widgetSortButtons li { margin-right: 10px; }');
		RESUtils.addCSS('.RESDashboardComponentHeader ul li.active, .RESDashboardComponentHeader ul li:hover { background-color: #a6ccf1; color: #fff; border-color: #699dcf; }');
		RESUtils.addCSS('ul.widgetStateButtons li { margin-right: 5px; }');
		RESUtils.addCSS('ul.widgetStateButtons li:last-child { margin-right: 0; }');
		RESUtils.addCSS('ul.widgetStateButtons li.disabled { background-color: #ddd; }');
		RESUtils.addCSS('ul.widgetStateButtons li.disabled:hover { cursor: auto; background-color: #ddd; color: #6c6c6c; border: 1px solid #c7c7c7; }');
		RESUtils.addCSS('ul.widgetSortButtons { margin-left: 10px; }');
		RESUtils.addCSS('ul.widgetStateButtons { float: right; margin-right: 8px; }');
		RESUtils.addCSS('ul.widgetStateButtons li.updateTime { cursor: auto; background: none; border: none; color: #afafaf; font-size: 9px; padding-right: 0; }');
		RESUtils.addCSS('ul.widgetStateButtons li.minimize, ul.widgetStateButtons li.close { font-size: 24px; }');
		RESUtils.addCSS('.minimized ul.widgetStateButtons li.minimize { font-size: 14px; }');
		RESUtils.addCSS('ul.widgetStateButtons li.refresh { margin-left: 3px; width: 24px; position:relative; padding: 0; }');
		RESUtils.addCSS('ul.widgetStateButtons li.refresh div { height: 16px; width: 16px; position: absolute; left: 4px; top: 4px; background-image: url("https://s3.amazonaws.com/e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); background-repeat: no-repeat; background-position: -16px -209px; }');
		RESUtils.addCSS('#userTaggerContents .show { display: inline-block; }');
		RESUtils.addCSS('#tagPageControls { display: inline-block; position: relative; top: 9px;}');

		var dbLinks = $('span.redditname a');
		if ($(dbLinks).length > 1) {
			$(dbLinks[0]).addClass('active');
		}

		// add each subreddit widget...
		// add the "add widget" form...
		this.attachContainer();
		this.attachAddComponent();
		this.attachEditComponent();
		this.initUpdateQueue();
	},
	initUpdateQueue: function() {
		modules['dashboard'].updateQueue = [];
		for (var i in this.widgets)
			if (this.widgets[i]) this.addWidget(this.widgets[i]);

		setTimeout(function() {
			$('#RESDashboard').dragsort({
				dragSelector: "div.RESDashboardComponentHeader",
				dragSelectorExclude: 'a, li.refreshAll, li.refresh > div, .editButton',
				dragEnd: modules['dashboard'].saveOrder,
				placeHolderTemplate: "<li class='placeHolder'></li>"
			});
			// dragSelectorExclude: 'a, li.refreshAll, li.refresh > div, .editButton, div.placeHolder',
		}, 300);
	},
	addToUpdateQueue: function(updateFunction) {
		modules['dashboard'].updateQueue.push(updateFunction);
		if (!modules['dashboard'].updateQueueTimer) {
			modules['dashboard'].updateQueueTimer = setInterval(modules['dashboard'].processUpdateQueue, 2000);
			setTimeout(modules['dashboard'].processUpdateQueue, 100);
		}
	},
	processUpdateQueue: function() {
		var thisUpdate = modules['dashboard'].updateQueue.pop();
		thisUpdate();
		if (modules['dashboard'].updateQueue.length < 1) {
			clearInterval(modules['dashboard'].updateQueueTimer);
			delete modules['dashboard'].updateQueueTimer;
		}
	},
	saveOrder: function() {
		var data = $("#siteTable li.RESDashboardComponent").map(function() {
			return $(this).attr("id");
		}).get();
		data.reverse();
		var newOrder = [];
		for (var i = 0, len = modules['dashboard'].widgets.length; i < len; i++) {
			var newIndex = data.indexOf(modules['dashboard'].widgets[i].basePath.replace(/(\/|\+)/g, '_'));
			newOrder[newIndex] = modules['dashboard'].widgets[i];
		}
		modules['dashboard'].widgets = newOrder;
		delete newOrder;
		RESStorage.setItem('RESmodules.dashboard.' + RESUtils.loggedInUser(), JSON.stringify(modules['dashboard'].widgets));
	},
	attachContainer: function() {
		this.siteTable = $('#siteTable.linklisting');
		$(this.siteTable).append('<div id="dashboardContents" class="dashboardPane" />');
		if ((location.hash !== '') && (location.hash !== '#dashboardContents')) {
			$('span.redditname a').removeClass('active');
			var activeTabID = location.hash.replace('#', '#tab-');
			$(activeTabID).addClass('active');
			$('.dashboardPane').hide();
			$(location.hash).show();
		} else {
			$('#userTaggerContents').hide();
		}
		$('span.redditname a:first').click(function(e) {
			e.preventDefault();
			location.hash = 'dashboardContents';
			$('span.redditname a').removeClass('active');
			$(this).addClass('active');
			$('.dashboardPane').hide();
			$('#dashboardContents').show();
		});
	},
	attachEditComponent: function() {
		this.dashboardContents = $('#dashboardContents');
		this.dashboardEditComponent = $('<div id="RESDashboardEditComponent" class="RESDashboardComponent" />');
		$(this.dashboardEditComponent).html(' \
			<div class="editWidget">Edit widget</div> \
			<div id="editRedditFormContainer" class="editRedditForm"> \
				<form id="editRedditForm"> \
					<input type="text" id="editReddit"> \
					<input type="text" id="editRedditDisplayName" placeholder="display name (e.g. stuff)"> \
					<input type="submit" class="updateButton" value="save changes"> \
					<input type="cancel" class="cancelButton" value="cancel"> \
				</form> \
			</div> \
		');
		var thisEle = $(this.dashboardEditComponent).find('#editReddit');

		$(this.dashboardEditComponent).find('#editRedditForm').submit(
			function(e) {
				e.preventDefault();
				var thisBasePath = $('#editReddit').val();
				if (thisBasePath !== '') {
					if (thisBasePath.indexOf(',') !== -1) {
						thisBasePath = thisBasePath.replace(/\,/g, '+');
					}
					modules['dashboard'].widgetBeingEdited.formerBasePath = modules['dashboard'].widgetBeingEdited.basePath;
					modules['dashboard'].widgetBeingEdited.basePath = '/r/' + thisBasePath;
					modules['dashboard'].widgetBeingEdited.displayName = $('#editRedditDisplayName').val();
					modules['dashboard'].widgetBeingEdited.update();
					$('#editReddit').tokenInput('clear');
					$('#RESDashboardEditComponent').fadeOut(function() {
						$('#editReddit').blur();
					});
					modules['dashboard'].widgetBeingEdited.widgetEle.find('.widgetPath').text(modules['dashboard'].widgetBeingEdited.displayName).attr('title', '/r/' + thisBasePath);
					modules['dashboard'].updateWidget();
				}
			}
		);
		$(this.dashboardEditComponent).find('.cancelButton').click(
			function(e) {
				$('#editReddit').tokenInput('clear');
				$('#RESDashboardEditComponent').fadeOut(function() {
					$('#editReddit').blur();
				});
			}
		);
		$(document.body).append(this.dashboardEditComponent);
	},
	showEditForm: function() {
		var basePath = modules['dashboard'].widgetBeingEdited.basePath;
		var widgetEle = modules['dashboard'].widgetBeingEdited.widgetEle;
		$('#editRedditDisplayName').val(modules['dashboard'].widgetBeingEdited.displayName);
		var eleTop = $(widgetEle).position().top;
		var eleWidth = $(widgetEle).width();
		$('#RESDashboardEditComponent').css('top', eleTop + 'px').css('left', '5px').css('width', (eleWidth + 2) + 'px').fadeIn('fast');
		basePath = basePath.replace(/^\/r\//, '');
		var prepop = [];
		var reddits = basePath.split('+');
		for (var i = 0, len = reddits.length; i < len; i++) {
			prepop.push({
				id: reddits[i],
				name: reddits[i]
			});
		}
		if (typeof modules['dashboard'].firstEdit === 'undefined') {
			$('#editReddit').tokenInput('/api/search_reddit_names.json?app=res', {
				method: "POST",
				queryParam: "query",
				theme: "facebook",
				allowFreeTagging: true,
				zindex: 999999999,
				onResult: function(response) {
					var names = response.names;
					var results = [];
					for (var i = 0, len = names.length; i < len; i++) {
						results.push({
							id: names[i],
							name: names[i]
						});
					}
					if (names.length === 0) {
						var failedQueryValue = $('#token-input-editReddit').val();
						results.push({
							id: failedQueryValue,
							name: failedQueryValue,
							failedResult: true
						});
					}
					return results;
				},
				onCachedResult: function(response) {
					var names = response.names;
					var results = [];
					for (var i = 0, len = names.length; i < len; i++) {
						results.push({
							id: names[i],
							name: names[i]
						});
					}
					if (names.length === 0) {
						var failedQueryValue = $('#token-input-editReddit').val();
						results.push({
							id: failedQueryValue,
							name: failedQueryValue,
							failedResult: true
						});
					}
					return results;
				},
				prePopulate: prepop,
				searchingText: 'Searching for matching reddits - may take a few seconds...',
				hintText: 'Type one or more subreddits for which to create a widget.',
				resultsFormatter: function(item) {
					var thisDesc = item.name;
					if (item['failedResult']) thisDesc += ' - [this subreddit may not exist, ensure proper spelling]';
					return "<li>" + thisDesc + "</li>"
				}
			});
			modules['dashboard'].firstEdit = true;
		} else {
			$('#editReddit').tokenInput('clear');
			for (var i = 0, len = prepop.length; i < len; i++) {
				$('#editReddit').tokenInput('add', prepop[i]);
			}
		}
	},
	attachAddComponent: function() {
		this.dashboardContents = $('#dashboardContents');
		this.dashboardAddComponent = $('<div id="RESDashboardAddComponent" class="RESDashboardComponent" />');
		$(this.dashboardAddComponent).html(' \
			<div class="addNewWidget">Add a new widget</div> \
			<div id="addWidgetButtons"> \
				<div class="addButton" id="addMailWidget">+mail widget</div> \
				<div class="addButton" id="addUserWidget">+user widget</div> \
				<div class="addButton" id="addRedditWidget">+subreddit widget</div> \
			</div> \
			<div id="addMailWidgetContainer"> \
				<div class="backToWidgetTypes">&laquo; back</div> \
				<div class="addButton widgetShortcut" widgetPath="/message/inbox/">+inbox</div> \
				<div class="addButton widgetShortcut" widgetPath="/message/unread/">+unread</div> \
				<div class="addButton widgetShortcut" widgetPath="/message/messages/">+messages</div> \
				<div class="addButton widgetShortcut" widgetPath="/message/comments/">+comment replies</div> \
				<div class="addButton widgetShortcut" widgetPath="/message/selfreply/">+post replies</div> \
			</div> \
			<div id="addUserFormContainer" class="addUserForm"> \
				<div class="backToWidgetTypes">&laquo; back</div> \
				<form id="addUserForm"> \
					<input type="text" id="addUser"> \
					<input type="submit" class="addButton" value="+add"> \
				</form> \
			</div> \
			<div id="addRedditFormContainer" class="addRedditForm"> \
				<div class="backToWidgetTypes">&laquo; back</div> \
				<form id="addRedditForm"> \
					<input type="text" id="addReddit"> \
					<input type="text" id="addRedditDisplayName" placeholder="display name (e.g. stuff)"> \
					<input type="submit" class="addButton" value="+add"> \
				</form> \
			</div> \
		');
		$(this.dashboardAddComponent).find('.backToWidgetTypes').click(function(e) {
			$(this).parent().fadeOut(function() {
				$('#addWidgetButtons').fadeIn();
			});
		});
		$(this.dashboardAddComponent).find('.widgetShortcut').click(function(e) {
			var thisBasePath = $(this).attr('widgetPath');
			modules['dashboard'].addWidget({
				basePath: thisBasePath
			}, true);
			$('#addMailWidgetContainer').fadeOut(function() {
				$('#addWidgetButtons').fadeIn();
			});
		});
		$(this.dashboardAddComponent).find('#addRedditWidget').click(function(e) {
			$('#addWidgetButtons').fadeOut(function() {
				$('#addRedditFormContainer').fadeIn(function() {
					$('#token-input-addReddit').focus();
				});
			});
		});
		$(this.dashboardAddComponent).find('#addMailWidget').click(function(e) {
			$('#addWidgetButtons').fadeOut(function() {
				$('#addMailWidgetContainer').fadeIn();
			});
		});;
		$(this.dashboardAddComponent).find('#addUserWidget').click(function(e) {
			$('#addWidgetButtons').fadeOut(function() {
				$('#addUserFormContainer').fadeIn();
			});
		});;
		var thisEle = $(this.dashboardAddComponent).find('#addReddit');
		$(thisEle).tokenInput('/api/search_reddit_names.json?app=res', {
			method: "POST",
			queryParam: "query",
			theme: "facebook",
			allowFreeTagging: true,
			zindex: 999999999,
			onResult: function(response) {
				var names = response.names;
				var results = [];
				for (var i = 0, len = names.length; i < len; i++) {
					results.push({
						id: names[i],
						name: names[i]
					});
				}
				if (names.length === 0) {
					var failedQueryValue = $('#token-input-addReddit').val();
					results.push({
						id: failedQueryValue,
						name: failedQueryValue,
						failedResult: true
					});
				}
				return results;
			},
			onCachedResult: function(response) {
				var names = response.names;
				var results = [];
				for (var i = 0, len = names.length; i < len; i++) {
					results.push({
						id: names[i],
						name: names[i]
					});
				}
				if (names.length === 0) {
					var failedQueryValue = $('#token-input-addReddit').val();
					results.push({
						id: failedQueryValue,
						name: failedQueryValue,
						failedResult: true
					});
				}
				return results;
			},
			/* prePopulate: prepop, */
			searchingText: 'Searching for matching reddits - may take a few seconds...',
			hintText: 'Type one or more subreddits for which to create a widget.',
			resultsFormatter: function(item) {
				var thisDesc = item.name;
				if (item['failedResult']) thisDesc += ' - [this subreddit may not exist, ensure proper spelling]';
				return "<li>" + thisDesc + "</li>"
			}
		});

		$(this.dashboardAddComponent).find('#addRedditForm').submit(
			function(e) {
				e.preventDefault();
				var thisBasePath = $('#addReddit').val();
				if (thisBasePath !== '') {
					if (thisBasePath.indexOf(',') !== -1) {
						thisBasePath = thisBasePath.replace(/\,/g, '+');
					}
					var thisDisplayName = ($('#addRedditDisplayName').val()) ? $('#addRedditDisplayName').val() : thisBasePath;
					modules['dashboard'].addWidget({
						basePath: thisBasePath,
						displayName: thisDisplayName
					}, true);
					// $('#addReddit').val('').blur();
					$('#addReddit').tokenInput('clear');
					$('#addRedditFormContainer').fadeOut(function() {
						$('#addReddit').blur();
						$('#addWidgetButtons').fadeIn();
					});
				}
			}
		);
		$(this.dashboardAddComponent).find('#addUserForm').submit(
			function(e) {
				e.preventDefault();
				var thisBasePath = '/user/' + $('#addUser').val();
				modules['dashboard'].addWidget({
					basePath: thisBasePath
				}, true);
				$('#addUser').val('').blur();
				$('#addUserFormContainer').fadeOut(function() {
					$('#addWidgetButtons').fadeIn();
				});

			}
		);
		$(this.dashboardContents).append(this.dashboardAddComponent);
		this.dashboardUL = $('<ul id="RESDashboard"></ul>');
		$(this.dashboardContents).append(this.dashboardUL);
	},
	addWidget: function(optionsObject, isNew) {
		if (optionsObject.basePath.slice(0, 1) !== '/') optionsObject.basePath = '/r/' + optionsObject.basePath;
		var exists = false;
		for (var i = 0, len = this.widgets.length; i < len; i++) {
			if (this.widgets[i].basePath == optionsObject.basePath) {
				exists = true;
				break;
			}
		}
		// hide any shortcut button for this widget, since it exists... wait a second, though, or it causes rendering stupidity.
		setTimeout(function() {
			$('.widgetShortcut[widgetPath="' + optionsObject.basePath + '"]').hide();
		}, 1000);
		if (exists && isNew) {
			alert('A widget for ' + optionsObject.basePath + ' already exists!');
		} else {
			var thisWidget = new this.widgetObject(optionsObject);
			thisWidget.init();
			modules['dashboard'].saveWidget(thisWidget.optionsObject());
		}
	},
	removeWidget: function(optionsObject) {
		this.getLatestWidgets();
		var exists = false;
		for (var i = 0, len = modules['dashboard'].widgets.length; i < len; i++) {
			if (modules['dashboard'].widgets[i].basePath == optionsObject.basePath) {
				exists = true;
				$('#' + modules['dashboard'].widgets[i].basePath.replace(/\/|\+/g, '_')).fadeOut('slow', function(ele) {
					$(this).detach();
				});
				modules['dashboard'].widgets.splice(i, 1);
				// show any shortcut button for this widget, since we've now deleted it...
				setTimeout(function() {
					$('.widgetShortcut[widgetPath="' + optionsObject.basePath + '"]').show();
				}, 1000);
				break;
			}
		}
		if (!exists) {
			modules['notifications'].showNotification({
				moduleID: 'dashboard',
				type: 'error',
				message: 'The widget you just tried to remove does not seem to exist.'
			});
		}
		RESStorage.setItem('RESmodules.dashboard.' + RESUtils.loggedInUser(), JSON.stringify(modules['dashboard'].widgets));
	},
	saveWidget: function(optionsObject, init) {
		this.getLatestWidgets();
		var exists = false;
		for (var i = 0, len = modules['dashboard'].widgets.length; i < len; i++) {
			if (modules['dashboard'].widgets[i].basePath == optionsObject.basePath) {
				exists = true;
				modules['dashboard'].widgets[i] = optionsObject;
			}
		}
		if (!exists) modules['dashboard'].widgets.push(optionsObject);
		RESStorage.setItem('RESmodules.dashboard.' + RESUtils.loggedInUser(), JSON.stringify(modules['dashboard'].widgets));
	},
	updateWidget: function() {
		this.getLatestWidgets();
		var exists = false;
		for (var i = 0, len = modules['dashboard'].widgets.length; i < len; i++) {
			if (modules['dashboard'].widgets[i].basePath == modules['dashboard'].widgetBeingEdited.formerBasePath) {
				exists = true;
				delete modules['dashboard'].widgetBeingEdited.formerBasePath;
				modules['dashboard'].widgets[i] = modules['dashboard'].widgetBeingEdited.optionsObject();
			}
		}
		RESStorage.setItem('RESmodules.dashboard.' + RESUtils.loggedInUser(), JSON.stringify(modules['dashboard'].widgets));
	},
	widgetObject: function(widgetOptions) {
		var thisWidget = this; // keep a reference because the this keyword can mean different things in different scopes...
		thisWidget.basePath = widgetOptions.basePath;
		if ((typeof widgetOptions.displayName === 'undefined') || (widgetOptions.displayName === null)) {
			widgetOptions.displayName = thisWidget.basePath;
		}
		thisWidget.displayName = widgetOptions.displayName;
		thisWidget.numPosts = widgetOptions.numPosts || modules['dashboard'].options.defaultPosts.value;
		thisWidget.sortBy = widgetOptions.sortBy || modules['dashboard'].options.defaultSort.value;
		thisWidget.minimized = widgetOptions.minimized || false;
		thisWidget.widgetEle = $('<li class="RESDashboardComponent" id="' + thisWidget.basePath.replace(/\/|\+/g, '_') + '"><div class="RESDashboardComponentScrim"><div class="RESDashboardComponentLoader"><img id="dashboardLoader" src="' + modules['dashboard'].loader + '"><span>querying the server. one moment please.</span></div></div></li>');
		var editButtonHTML = (thisWidget.basePath.indexOf('/r/') === -1) ? '' : '<div class="editButton" title="edit"></div>';
		thisWidget.header = $('<div class="RESDashboardComponentHeader"><a class="widgetPath" title="' + thisWidget.basePath + '" href="' + thisWidget.basePath + '">' + thisWidget.displayName + '</a></div>');
		thisWidget.sortControls = $('<ul class="widgetSortButtons"><li sort="hot">hot</li><li sort="new">new</li><li sort="controversial">controversial</li><li sort="top">top</li></ul>');
		// return an optionsObject, which is what we'll store in the modules['dashboard'].widgets array.
		thisWidget.optionsObject = function() {
			return {
				basePath: thisWidget.basePath,
				displayName: thisWidget.displayName,
				numPosts: thisWidget.numPosts,
				sortBy: thisWidget.sortBy,
				minimized: thisWidget.minimized
			};
		};
		// set the sort by properly...
		$(thisWidget.sortControls).find('li[sort=' + thisWidget.sortBy + ']').addClass('active');
		$(thisWidget.sortControls).find('li').click(function(e) {
			thisWidget.sortChange($(e.target).attr('sort'));
		});
		$(thisWidget.header).append(thisWidget.sortControls);
		if ((thisWidget.basePath.indexOf('/r/') !== 0) && (thisWidget.basePath.indexOf('/user/') !== 0)) {
			setTimeout(function() {
				$(thisWidget.sortControls).hide();
			}, 100);
		}
		thisWidget.stateControls = $('<ul class="widgetStateButtons"><li class="updateTime"></li><li action="refresh" class="refresh"><div action="refresh"></div></li><li action="refreshAll" class="refreshAll">Refresh All</li><li action="addRow">+row</li><li action="subRow">-row</li><li action="edit" class="editButton"></li><li action="minimize" class="minimize">-</li><li action="delete" class="RESClose">&times;</li></ul>');
		$(thisWidget.stateControls).find('li').click(function(e) {
			switch ($(e.target).attr('action')) {
				case 'refresh':
					thisWidget.update();
					break;
				case 'refreshAll':
					$('li[action="refresh"]').click();
					break;
				case 'addRow':
					if (thisWidget.numPosts === 10) break;
					thisWidget.numPosts++;
					if (thisWidget.numPosts === 10) $(thisWidget.stateControls).find('li[action=addRow]').addClass('disabled');
					$(thisWidget.stateControls).find('li[action=subRow]').removeClass('disabled');
					modules['dashboard'].saveWidget(thisWidget.optionsObject());
					thisWidget.update();
					break;
				case 'subRow':
					if (thisWidget.numPosts === 0) break;
					thisWidget.numPosts--;
					if (thisWidget.numPosts === 1) $(thisWidget.stateControls).find('li[action=subRow]').addClass('disabled');
					$(thisWidget.stateControls).find('li[action=addRow]').removeClass('disabled');
					modules['dashboard'].saveWidget(thisWidget.optionsObject());
					thisWidget.update();
					break;
				case 'minimize':
					$(thisWidget.widgetEle).toggleClass('minimized');
					if ($(thisWidget.widgetEle).hasClass('minimized')) {
						$(e.target).text('+');
						thisWidget.minimized = true;
					} else {
						$(e.target).text('-');
						thisWidget.minimized = false;
						thisWidget.update();
					}
					$(thisWidget.contents).parent().slideToggle();
					modules['dashboard'].saveWidget(thisWidget.optionsObject());
					break;
				case 'delete':
					modules['dashboard'].removeWidget(thisWidget.optionsObject());
					break;
			}
		});
		$(thisWidget.header).append(thisWidget.stateControls);
		thisWidget.sortChange = function(sortBy) {
			thisWidget.sortBy = sortBy;
			$(thisWidget.header).find('ul.widgetSortButtons li').removeClass('active');
			$(thisWidget.header).find('ul.widgetSortButtons li[sort=' + sortBy + ']').addClass('active');
			thisWidget.update();
			modules['dashboard'].saveWidget(thisWidget.optionsObject());
		};
		thisWidget.edit = function(e) {
			modules['dashboard'].widgetBeingEdited = thisWidget;
			modules['dashboard'].showEditForm();
		};
		$(thisWidget.header).find('.editButton').click(thisWidget.edit);
		thisWidget.update = function() {
			if (thisWidget.basePath.indexOf('/user/') !== -1) {
				thisWidget.sortPath = (thisWidget.sortBy === 'hot') ? '/' : '?sort=' + thisWidget.sortBy;
			} else if (thisWidget.basePath.indexOf('/r/') !== -1) {
				thisWidget.sortPath = (thisWidget.sortBy === 'hot') ? '/' : '/' + thisWidget.sortBy + '/';
			} else {
				thisWidget.sortPath = '';
			}
			thisWidget.url = location.protocol + '//' + location.hostname + '/' + thisWidget.basePath + thisWidget.sortPath;
			$(thisWidget.contents).fadeTo('fast', 0.25);
			$(thisWidget.scrim).fadeIn();
			$.ajax({
				url: thisWidget.url,
				data: {
					limit: thisWidget.numPosts
				},
				success: thisWidget.populate,
				error: thisWidget.error
			});
		};
		thisWidget.container = $('<div class="RESDashboardComponentContainer"><div class="RESDashboardComponentContents"></div></div>');
		if (thisWidget.minimized) {
			$(thisWidget.container).addClass('minimized');
			$(thisWidget.stateControls).find('li.minimize').addClass('minimized').text('+');
		}
		thisWidget.scrim = $(thisWidget.widgetEle).find('.RESDashboardComponentScrim');
		thisWidget.contents = $(thisWidget.container).find('.RESDashboardComponentContents');
		thisWidget.init = function() {
			if (RESUtils.currentSubreddit('dashboard')) {
				thisWidget.draw();
				if (!thisWidget.minimized) modules['dashboard'].addToUpdateQueue(thisWidget.update);
			}
		};
		thisWidget.draw = function() {
			$(thisWidget.widgetEle).append(thisWidget.header);
			$(thisWidget.widgetEle).append(thisWidget.container);
			if (thisWidget.minimized) $(thisWidget.widgetEle).addClass('minimized');
			modules['dashboard'].dashboardUL.prepend(thisWidget.widgetEle);
			// $(thisWidget.scrim).fadeIn();
		};
		thisWidget.populate = function(response) {
			var $widgetContent = $(response).find('#siteTable'),
				$thisWidgetContents = $(thisWidget.contents);

			$widgetContent.attr('id', 'siteTable_' + thisWidget.basePath.replace(/\/|\+/g, '_'));
			if ($widgetContent.length === 2) $widgetContent = $($widgetContent[1]);
			$widgetContent.attr('url', thisWidget.url + '?limit=' + thisWidget.numPosts);
			if (($widgetContent.length > 0) && ($widgetContent.html() !== '')) {
				$widgetContent.html($widgetContent.html().replace(/<script(.|\s)*?\/script>/g, ''));

				// $widgetContent will contain HTML from Reddit's page load. No XSS here or you'd already be hit, can't call escapeHTML on this either and wouldn't help anyhow.
				try {
					$thisWidgetContents.empty().append($widgetContent);
				} catch (e) {
					// console.log(e);
				}
				
				$thisWidgetContents.fadeTo('fast', 1);
				$(thisWidget.scrim).fadeOut(function(e) {
					$(this).hide(); // make sure it is hidden in case the element isn't visible due to being on a different dashboard tab
				});
			} else {
				if (thisWidget.url.indexOf('/message/') !== -1) {
					$thisWidgetContents.html('<div class="widgetNoMail">No messages were found.</div>');
				} else {
					$thisWidgetContents.html('<div class="error">There were no results returned for this widget. If you made a typo, simply close the widget to delete it. If reddit is just under heavy load, try clicking refresh in a few moments.</div>');
				}
				$thisWidgetContents.fadeTo('fast', 1);
				$(thisWidget.scrim).fadeOut();
			}
			$(thisWidget.stateControls).find('.updateTime').text('updated: ' + RESUtils.niceDateTime());

			// now run watcher functions from other modules on this content...
			RESUtils.watchers.siteTable.forEach(function(callback) {
				if (callback) callback($widgetContent[0]);
			});
		};
		thisWidget.error = function(xhr, err) {
			// alert('There was an error loading data for this widget. Did you type a bad path, perhaps? Removing this widget automatically.');
			// modules['dashboard'].removeWidget(thisWidget.optionsObject());
			if (xhr.status === 404) {
				$(thisWidget.contents).html('<div class="error">This widget received a 404 not found error. You may have made a typo when adding it.</div>');
			} else {
				$(thisWidget.contents).html('<div class="error">There was an error loading data for this widget. Reddit may be under heavy load, or you may have provided an invalid path.</div>');
			}
			$(thisWidget.scrim).fadeOut();
			$(thisWidget.contents).fadeTo('fast', 1);
		};
	},
	addDashboardShortcuts: function() {
		var subButtons = document.querySelectorAll('.fancy-toggle-button');
		for (var h = 0, len = subButtons.length; h < len; h++) {
			var subButton = subButtons[h];
			if ((RESUtils.currentSubreddit().indexOf('+') === -1) && (RESUtils.currentSubreddit() !== 'mod')) {
				var thisSubredditFragment = RESUtils.currentSubreddit();
				var isMulti = false;
			} else if ($(subButton).parent().hasClass('subButtons')) {
				var isMulti = true;
				var thisSubredditFragment = $(subButton).parent().parent().find('a.title').text();
			} else {
				var isMulti = true;
				var thisSubredditFragment = $(subButton).next().text();
			}
			if (!($('#subButtons-' + thisSubredditFragment).length > 0)) {
				var subButtonsWrapper = $('<div id="subButtons-' + thisSubredditFragment + '" class="subButtons" style="margin: 0 !important;"></div>');
				$(subButton).wrap(subButtonsWrapper);
				// move this wrapper to the end (after any icons that may exist...)
				if (isMulti) {
					var theWrap = $(subButton).parent();
					$(theWrap).appendTo($(theWrap).parent());
				}
			}
			var dashboardToggle = document.createElement('span');
			dashboardToggle.setAttribute('class', 'REStoggle RESDashboardToggle');
			dashboardToggle.setAttribute('data-subreddit', thisSubredditFragment);
			var exists = false;
			for (var i = 0, sublen = this.widgets.length; i < sublen; i++) {
				if ((this.widgets[i]) && (this.widgets[i].basePath.toLowerCase() === '/r/' + thisSubredditFragment.toLowerCase())) {
					exists = true;
					break;
				}
			}
			if (exists) {
				dashboardToggle.textContent = '-dashboard';
				dashboardToggle.setAttribute('title', 'Remove this subreddit from your dashboard');
				dashboardToggle.classList.add('remove');
			} else {
				dashboardToggle.textContent = '+dashboard';
				dashboardToggle.setAttribute('title', 'Add this subreddit to your dashboard');
			}
			dashboardToggle.setAttribute('data-subreddit', thisSubredditFragment)
			dashboardToggle.addEventListener('click', modules['dashboard'].toggleDashboard, false);
			$('#subButtons-' + thisSubredditFragment).append(dashboardToggle);
			var next = $('#subButtons-' + thisSubredditFragment).next();
			if ($(next).hasClass('title') && (!$('#subButtons-' + thisSubredditFragment).hasClass('swapped'))) {
				$('#subButtons-' + thisSubredditFragment).before($(next));
				$('#subButtons-' + thisSubredditFragment).addClass('swapped');
			}
		}
	},
	toggleDashboard: function(e) {
		var thisBasePath = '/r/' + $(e.target).data('subreddit');
		if (e.target.classList.contains('remove')) {
			modules['dashboard'].removeWidget({
				basePath: thisBasePath
			}, true);
			e.target.textContent = '+dashboard';
			e.target.classList.remove('remove');
		} else {
			modules['dashboard'].addWidget({
				basePath: thisBasePath
			}, true);
			e.target.textContent = '-dashboard';
			modules['notifications'].showNotification({
				header: 'Dashboard Notification',
				moduleID: 'dashboard',
				message: 'Dashboard widget added for ' + thisBasePath + ' <p><a class="RESNotificationButtonBlue" href="/r/Dashboard">view the dashboard</a></p><div class="clear"></div>'
			});
			e.target.classList.add('remove');
		}
	},
	addTab: function(tabID, tabName) {
		$('#siteTable.linklisting').append('<div id="' + tabID + '" class="dashboardPane" />');
		$('span.redditname').append('<a id="tab-' + tabID + '" class="dashboardTab" title="' + tabName + '">' + tabName + '</a>');
		$('#tab-' + tabID).click(function(e) {
			location.hash = tabID;
			$('span.redditname a').removeClass('active');
			$(this).addClass('active');
			$('.dashboardPane').hide();
			$('#' + tabID).show();
		});
	}
};


addModule('notifications', function (module, moduleID) {
	$.extend(module, {
		moduleName: 'RES Notifications',
		category: 'UI',
		description: 'Manage pop-up notifications for RES functions',
		include: [
			/.*/i
		]
	});
	module.options = {
		closeDelay: {
			type: 'text',
			value: 3000,
			description: 'Delay, in milliseconds, before notification fades away'
		},
		sticky: {
			description: 'Allow notifications to be "sticky" and stay visible until you manually close them',
			type: 'enum',
			value: 'perNotification',
			values: [{
				name: 'notificationType',
				value: 'notificationType'
			}, {
				name: 'all',
				value: 'all'
			}, {
				name: 'none',
				value: 'none'
			}]
		},
		notificationTypes: {
			description: 'Manage different types of notifications',
			type: 'table',
			addRowText: 'manually register notification type',
			fields: [
				{ 
					name: 'moduleID',
					type: 'text'
				},
				{
					name: 'notificationID',
					type: 'text'
				},
				{
					name: 'enabled',
					type: 'boolean',
					value: true
				},
				{
					name: 'sticky',
					type: 'boolean',
					value: false
				}
			]
		}
	};

	module.saveOptions =function() {
		RESStorage.setItem('RESoptions.notifications', JSON.stringify(modules['notifications'].options));
	};
	var addNotificationTypeOption = function (notificationType) {
		var option = modules['notifications'].options['notificationTypes'];
		var value = RESUtils.mapObjectToTableOptionValue(modules['notifications'].options.notificationTypes, notificationType);
		option.value = option.value || [];
		option.value.push(value);

		modules['notifications'].saveOptions();
		return option.value[option.value.length - 1];
	};
	module.getOrAddNotificationType = function(notification) {
		var option = modules['notifications'].options['notificationTypes'];
		var notificationTypeKey = {
			moduleID: RESUtils.firstValid(notification.moduleID, '--'),
			notificationID: RESUtils.firstValid(notification.notificationID, notification.optionKey, notification.header, RESUtils.hashCode(notification.message || '')),
		};
		var notificationMetadata = $.extend({}, notification, notificationTypeKey);

		var optionValue = getNotificationTypeOption(notificationTypeKey);
		if (!optionValue) {
			optionValue = addNotificationTypeOption(notificationMetadata);
		}

		var notificationType = RESUtils.mapTableOptionValueToObject(modules['notifications'].options.notificationTypes, optionValue, notificationMetadata);

		return notificationType;
	};
	var getNotificationTypeOption = function(notificationType) {
		var value;
		var values = modules['notifications'].options['notificationTypes'].value;
		for (var i = 0, length = values.length; i < length; i++) {
			value = values[i];
			if (value[0] == notificationType.moduleID && value[1] == notificationType.notificationID) {
				break; 
			}
		}
		if (i < length) {
			return value;
		}
	};
	module.enableNotificationType = function(notificationType, enabled) {
		var value = getNotificationTypeOption(notificationType);
		value[2] = !!enabled;
		modules['notifications'].saveOptions();
	};

	module.showNotification = function(contentObj, delay) {
		if (!module.isEnabled()) return;
		if (typeof contentObj.message === 'undefined') {
			if (typeof contentObj === 'string') {
				contentObj = { message: contentObj };
			} else {
				return false;
			}
		}

		var notificationType = module.getOrAddNotificationType(contentObj);
		 if (!notificationType.enabled) return;

		contentObj.renderedHeader = renderHeaderHtml(contentObj, notificationType);

		setupNotificationsContainer();

		var thisNotification = createNotificationElement(contentObj, notificationType);
		
		thisNotification.querySelector('.RESNotificationToggle input').addEventListener('change', function(e) {
			modules['notifications'].enableNotificationType(notificationType, e.target.checked);
		});
		var thisNotificationCloseButton = thisNotification.querySelector('.RESNotificationClose');
		thisNotificationCloseButton.addEventListener('click', function(e) {
			var thisNotification = e.target.parentNode.parentNode;
			modules['notifications'].closeNotification(thisNotification);
		}, false);

		var isSticky = modules['notifications'].options.sticky.value == 'all'
			|| (modules['notifications'].options.sticky.value == 'notificationType' && notificationType.sticky);
		if (!isSticky) {
			module.setCloseNotificationTimer(thisNotification, delay);
		} 
		module.RESNotifications.style.display = 'block';
		module.RESNotifications.appendChild(thisNotification);
		modules['styleTweaks'].setSRStyleToggleVisibility(false, 'notification');
		RESUtils.fadeElementIn(thisNotification, 0.2, 1);
		module.notificationCount++;

		return {
			element: thisNotification,
			close: function() { module.closeNotification(thisNotification); }
		}
	};

	function renderHeaderHtml(contentObj, notificationType) {
		var header;
		if (contentObj.header) {
			header = contentObj.header;
		} else {
			header = [];

			if (contentObj.moduleID && modules[contentObj.moduleID]) {
				header.push(modules[contentObj.moduleID].moduleName);
			}

			if (contentObj.type === 'error') {
				header.push('Error');
			} else {
				header.push('Notification');
			}


			header = header.join(' ');
		}

		if (contentObj.moduleID && modules[contentObj.moduleID]) {
			header += modules['settingsNavigation'].makeUrlHashLink(contentObj.moduleID, contentObj.optionKey, ' ', 'gearIcon');
		}

		header += '<label class="RESNotificationToggle">Enabled <input type="checkbox" checked></label>';

		return header;
	}

	function setupNotificationsContainer() {
		if (typeof module.notificationCount === 'undefined') {
			module.adFrame = document.body.querySelector('#ad-frame');
			if (module.adFrame) {
				module.adFrame.style.display = 'none';
			}
			module.notificationCount = 0;
			module.notificationTimers = [];
			module.RESNotifications = RESUtils.createElementWithID('div', 'RESNotifications');
			document.body.appendChild(module.RESNotifications);
		}
	}

	function createNotificationElement(contentObj, notificationType) {
		var thisNotification = document.createElement('div');
		thisNotification.classList.add('RESNotification');
		thisNotification.setAttribute('id', 'RESNotification-' + module.notificationCount);
		$(thisNotification).html('<div class="RESNotificationHeader"><h3>' + contentObj.renderedHeader + '</h3><div class="RESNotificationClose RESCloseButton">&times;</div></div><div class="RESNotificationContent">' + contentObj.message + '</div>');
		thisNotification.querySelector('.RESNotificationToggle').setAttribute('title', 'Show notifications from ' + notificationType.moduleID + ' - ' + notificationType.notificationID);
		return thisNotification;
	}

	module.setCloseNotificationTimer = function(e, delay) {
		delay = RESUtils.firstValid(delay, parseInt(modules['notifications'].options['closeDelay'].value, 10), modules['notifications'].options['closeDelay'].default);
		var thisNotification = (typeof e.currentTarget !== 'undefined') ? e.currentTarget : e;
		var thisNotificationID = thisNotification.getAttribute('id').split('-')[1];
		thisNotification.classList.add('timerOn');
		clearTimeout(modules['notifications'].notificationTimers[thisNotificationID]);
		var thisTimer = setTimeout(function() {
			modules['notifications'].closeNotification(thisNotification);
		}, delay);
		modules['notifications'].notificationTimers[thisNotificationID] = thisTimer;
		thisNotification.addEventListener('mouseover', modules['notifications'].cancelCloseNotificationTimer, false);
		thisNotification.removeEventListener('mouseout', modules['notifications'].setCloseNotification, false);
	};
	module.cancelCloseNotificationTimer = function(e) {
		var thisNotificationID = e.currentTarget.getAttribute('id').split('-')[1];
		e.currentTarget.classList.remove('timerOn');
		clearTimeout(modules['notifications'].notificationTimers[thisNotificationID]);
		e.target.removeEventListener('mouseover', modules['notifications'].cancelCloseNotification, false);
		e.currentTarget.addEventListener('mouseout', modules['notifications'].setCloseNotificationTimer, false);
	};
	module.closeNotification = function(ele) {
		RESUtils.fadeElementOut(ele, 0.1, modules['notifications'].notificationClosed);
	};
	module.notificationClosed = function(ele) {
		var notifications = modules['notifications'].RESNotifications.querySelectorAll('.RESNotification'),
			destroyed = 0;
		for (var i = 0, len = notifications.length; i < len; i++) {
			if (notifications[i].style.opacity === '0') {
				notifications[i].parentNode.removeChild(notifications[i]);
				destroyed++;
			}
		}
		if (destroyed == notifications.length) {
			modules['notifications'].RESNotifications.style.display = 'none';
			if (RESUtils.adFrame) RESUtils.adFrame.style.display = 'block';
		}

		modules['styleTweaks'].setSRStyleToggleVisibility(true, 'notification');
	};
});

modules['subredditInfo'] = {
	moduleID: 'subredditInfo',
	moduleName: 'Subreddit Info',
	category: 'UI',
	options: {
		hoverDelay: {
			type: 'text',
			value: 800,
			description: 'Delay, in milliseconds, before hover tooltip loads. Default is 800.'
		},
		fadeDelay: {
			type: 'text',
			value: 200,
			description: 'Delay, in milliseconds, before hover tooltip fades away. Default is 200.'
		},
		fadeSpeed: {
			type: 'text',
			value: 0.3,
			description: 'Fade animation\'s speed. Default is 0.3, the range is 0-1. Setting the speed to 1 will disable the animation.'
		},
		USDateFormat: {
			type: 'boolean',
			value: false,
			description: 'Show date (subreddit created...) in US format (i.e. 08-31-2010)'
		}
	},
	description: 'Adds a hover tooltip to subreddits',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[\?]*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var css = '';
			css += '.subredditInfoToolTip .subredditLabel { float: left; width: 140px; margin-bottom: 12px; }';
			css += '.subredditInfoToolTip .subredditDetail { float: left; width: 240px; margin-bottom: 12px; }';
			css += '.subredditInfoToolTip .blueButton { float: right; margin-left: 8px; }';
			css += '.subredditInfoToolTip .redButton { float: right; margin-left: 8px; }';
			RESUtils.addCSS(css);
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// create a cache for subreddit data so we only load it once even if the hover is triggered many times
			this.subredditInfoCache = [];
			this.srRe = /\/r\/(\w+)(?:\/(new|rising|controversial|top))?\/?$/i;

			// get subreddit links and add event listeners...
			this.addListeners();
			RESUtils.watchForElement('siteTable', modules['subredditInfo'].addListeners);
		}
	},
	addListeners: function(ele) {
		var ele = ele || document.body;
		var subredditLinks = document.body.querySelectorAll('.listing-page a.subreddit, .comment .md a[href^="/r/"]');
		if (subredditLinks) {
			var len = subredditLinks.length;
			for (var i = 0; i < len; i++) {
				var thisSRLink = subredditLinks[i];
				if (modules['subredditInfo'].srRe.test(thisSRLink.href)) {
					thisSRLink.addEventListener('mouseover', function(e) {
						modules['hover'].begin(e.target, {
							width: 450,
							openDelay: modules['subredditInfo'].options.hoverDelay.value,
							fadeDelay: modules['subredditInfo'].options.fadeDelay.value,
							fadeSpeed: modules['subredditInfo'].options.fadeSpeed.value
						}, modules['subredditInfo'].showSubredditInfo, {});
					}, false);
				}
			}
		}
	},
	showSubredditInfo: function(def, obj, context) {
		var mod = modules['subredditInfo'];
		var thisSubreddit = obj.href.replace(/.*\/r\//, '').replace(/\/$/, '');
		var header = document.createDocumentFragment();
		var link = $('<a href="/r/' + escapeHTML(thisSubreddit) + '">/r/' + escapeHTML(thisSubreddit) + '</a>');
		header.appendChild(link[0]);
		if (RESUtils.loggedInUser()) {
			var subscribeToggle = $('<span />');
			subscribeToggle
				.attr('id', 'RESHoverInfoSubscriptionButton')
				.addClass('RESFilterToggle')
				.css('margin-left', '12px')
				.hide()
				.on('click', modules['subredditInfo'].toggleSubscription);
			modules['subredditInfo'].updateToggleButton(subscribeToggle, false);

			header.appendChild(subscribeToggle[0]);
		}
		var body = '\
			<div class="subredditInfoToolTip">\
				<a class="hoverSubreddit" href="/user/' + escapeHTML(thisSubreddit) + '">' + escapeHTML(thisSubreddit) + '</a>:<br>\
				<span class="RESThrobber"></span> loading...\
			</div>';
		def.notify(header, null);
		if (typeof mod.subredditInfoCache[thisSubreddit] !== 'undefined') {
			mod.writeSubredditInfo(mod.subredditInfoCache[thisSubreddit], def);
		} else {
			GM_xmlhttpRequest({
				method: "GET",
				url: location.protocol + "//" + location.hostname + "/r/" + thisSubreddit + "/about.json?app=res",
				onload: function(response) {
					var thisResponse = safeJSON.parse(response.responseText, null, true);
					if (thisResponse) {
						mod.updateCache(thisSubreddit, thisResponse);
						mod.writeSubredditInfo(thisResponse, def);
					} else {
						mod.writeSubredditInfo({}, def);
					}
				}
			});
		}
	},
	updateCache: function(subreddit, data) {
		subreddit = subreddit.toLowerCase();
		if (!data.data) {
			data = {
				data: data
			};
		}
		this.subredditInfoCache = this.subredditInfoCache || [];
		this.subredditInfoCache[subreddit] = $.extend(true, {}, this.subredditInfoCache[subreddit], data);
	},
	writeSubredditInfo: function(jsonData, deferred) {
		if (!jsonData.data) {
			var srHTML = '<div class="subredditInfoToolTip">Subreddit not found</div>';
			var newBody = $(srHTML);
			deferred.resolve(null, newBody)
			return;
		}
		var utctime = jsonData.data.created_utc;
		var d = new Date(utctime * 1000);
		var isOver18;
		jsonData.data.over18 === true ? isOver18 = 'Yes' : isOver18 = 'No';
		var srHTML = '<div class="subredditInfoToolTip">';
		srHTML += '<div class="subredditLabel">Subreddit created:</div> <div class="subredditDetail">' + RESUtils.niceDate(d, this.options.USDateFormat.value) + ' (' + RESUtils.niceDateDiff(d) + ')</div>';
		srHTML += '<div class="subredditLabel">Subscribers:</div> <div class="subredditDetail">' + RESUtils.addCommas(jsonData.data.subscribers) + '</div>';
		srHTML += '<div class="subredditLabel">Title:</div> <div class="subredditDetail">' + escapeHTML(jsonData.data.title) + '</div>';
		srHTML += '<div class="subredditLabel">Over 18:</div> <div class="subredditDetail">' + escapeHTML(isOver18) + '</div>';
		// srHTML += '<div class="subredditLabel">Description:</div> <div class="subredditDetail">' + jsonData.data.description + '</div>';
		srHTML += '<div class="clear"></div><div id="subTooltipButtons" class="bottomButtons">';
		srHTML += '<div class="clear"></div></div>'; // closes bottomButtons div
		srHTML += '</div>';

		var newBody = $(srHTML);
		// bottom buttons will include: +filter +shortcut +dashboard (maybe sub/unsub too?)
		if (modules['subredditManager'].isEnabled()) {
			var theSC = document.createElement('span');
			theSC.setAttribute('style', 'display: inline-block !important;');
			theSC.setAttribute('class', 'REStoggle RESshortcut RESshortcutside');
			theSC.setAttribute('data-subreddit', jsonData.data.display_name.toLowerCase());
			var idx = -1;
			for (var i = 0, len = modules['subredditManager'].mySubredditShortcuts.length; i < len; i++) {
				if (modules['subredditManager'].mySubredditShortcuts[i].subreddit.toLowerCase() == jsonData.data.display_name.toLowerCase()) {
					idx = i;
					break;
				}
			}
			if (idx !== -1) {
				theSC.textContent = '-shortcut';
				theSC.setAttribute('title', 'Remove this subreddit from your shortcut bar');
				theSC.classList.add('remove');
			} else {
				theSC.textContent = '+shortcut';
				theSC.setAttribute('title', 'Add this subreddit to your shortcut bar');
			}
			theSC.addEventListener('click', modules['subredditManager'].toggleSubredditShortcut, false);

			newBody.find('#subTooltipButtons').append(theSC);
		}
		if (modules['dashboard'].isEnabled()) {
			var dashboardToggle = document.createElement('span');
			dashboardToggle.setAttribute('class', 'RESDashboardToggle');
			dashboardToggle.setAttribute('data-subreddit', jsonData.data.display_name.toLowerCase());
			var exists = false;
			for (var i = 0, len = modules['dashboard'].widgets.length; i < len; i++) {
				if ((modules['dashboard'].widgets[i]) && (modules['dashboard'].widgets[i].basePath.toLowerCase() === '/r/' + jsonData.data.display_name.toLowerCase())) {
					exists = true;
					break;
				}
			}
			if (exists) {
				dashboardToggle.textContent = '-dashboard';
				dashboardToggle.setAttribute('title', 'Remove this subreddit from your dashboard');
				dashboardToggle.classList.add('remove');
			} else {
				dashboardToggle.textContent = '+dashboard';
				dashboardToggle.setAttribute('title', 'Add this subreddit to your dashboard');
			}
			dashboardToggle.addEventListener('click', modules['dashboard'].toggleDashboard, false);
			newBody.find('#subTooltipButtons').append(dashboardToggle);
		}
		if (modules['filteReddit'].isEnabled()) {
			var filterToggle = document.createElement('span');
			filterToggle.setAttribute('class', 'RESFilterToggle');
			filterToggle.setAttribute('data-subreddit', jsonData.data.display_name.toLowerCase());
			var exists = false;
			var filteredReddits = modules['filteReddit'].options.subreddits.value;
			for (var i = 0, len = filteredReddits.length; i < len; i++) {
				if ((filteredReddits[i]) && (filteredReddits[i][0].toLowerCase() == jsonData.data.display_name.toLowerCase())) {
					exists = true;
					break;
				}
			}
			if (exists) {
				filterToggle.textContent = '-filter';
				filterToggle.setAttribute('title', 'Stop filtering from /r/all and /domain/*');
				filterToggle.classList.add('remove');
			} else {
				filterToggle.textContent = '+filter';
				filterToggle.setAttribute('title', 'Filter this subreddit from /r/all and /domain/*');
			}
			filterToggle.addEventListener('click', modules['filteReddit'].toggleFilter, false);
			newBody.find('#subTooltipButtons').append(filterToggle);
		}

		if (RESUtils.loggedInUser()) {
			var subscribed = !! jsonData.data.user_is_subscriber;

			var subscribeToggle = $('#RESHoverInfoSubscriptionButton');
			subscribeToggle.attr('data-subreddit', jsonData.data.display_name.toLowerCase());
			modules['subredditInfo'].updateToggleButton(subscribeToggle, subscribed);
			subscribeToggle.fadeIn('fast');
		}

		deferred.resolve(null, newBody)
	},
	updateToggleButton: function(toggleButton, subscribed) {
		if (toggleButton instanceof jQuery) toggleButton = toggleButton[0];
		var toggleOn = '+subscribe';
		var toggleOff = '-unsubscribe';
		if (subscribed) {
			toggleButton.textContent = toggleOff;
			toggleButton.classList.add('remove');
		} else {
			toggleButton.textContent = toggleOn;
			toggleButton.classList.remove('remove');
		}
	},
	toggleSubscription: function(e) {
		// Get info
		var subscribeToggle = e.target;
		var subreddit = subscribeToggle.getAttribute('data-subreddit').toLowerCase();
		var subredditData = modules['subredditInfo'].subredditInfoCache[subreddit].data;
		var subscribing = !subredditData.user_is_subscriber;

		modules['subredditInfo'].updateToggleButton(subscribeToggle, subscribing);

		modules['subredditManager'].subscribeToSubreddit(subredditData.name, subscribing);
		modules['subredditInfo'].updateCache(subreddit, {
			'user_is_subscriber': subscribing
		});
	}
}; // note: you NEED this semicolon at the end!



/**
 * CommentHidePersistor - stores hidden comments in localStorage and re-hides
 * them on reload of the page.
 **/
m_chp = modules['commentHidePersistor'] = {
	moduleID: 'commentHidePersistor',
	moduleName: 'Comment Hide Persistor',
	category: 'Comments',
	description: 'Saves the state of hidden comments across page views.',
	allHiddenThings: {},
	hiddenKeys: [],
	hiddenThings: [],
	hiddenThingsKey: window.location.href,
	maxKeys: 100,
	pruneKeysTo: 50,

	options: {},
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/comments\/[-\w\.]+/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			m_chp.bindToHideLinks();
			m_chp.hideHiddenThings();
		}
	},
	bindToHideLinks: function() {
		/**
		 * For every expand/collapse link, add a click listener that will
		 * store or remove the comment ID from our list of hidden comments.
		 **/
		$('body').on('click', 'a.expand', function() {
			var thing = $(this).parents('.thing'),
				thingId = thing.data('fullname'),
				collapsing = !$(this).parent().is('.collapsed');

			/* Add our key to pages interacted with, for potential pruning
			   later */
			if (m_chp.hiddenKeys.indexOf(m_chp.hiddenThingsKey) === -1) {
				m_chp.hiddenKeys.push(m_chp.hiddenThingsKey);
			}

			if (collapsing) {
				m_chp.addHiddenThing(thingId);
			} else {
				m_chp.removeHiddenThing(thingId);
			}
		});
	},
	loadHiddenThings: function() {
		var hidePersistorJson = RESStorage.getItem('RESmodules.commentHidePersistor.hidePersistor')

		if (hidePersistorJson) {
			try {
				m_chp.hidePersistorData = safeJSON.parse(hidePersistorJson)
				m_chp.allHiddenThings = m_chp.hidePersistorData['hiddenThings']
				m_chp.hiddenKeys = m_chp.hidePersistorData['hiddenKeys']

				/**
				 * Prune allHiddenThings of old content so it doesn't get
				 * huge.
				 **/
				if (m_chp.hiddenKeys.length > m_chp.maxKeys) {
					var pruneStart = m_chp.maxKeys - m_chp.pruneKeysTo,
						newHiddenThings = {},
						newHiddenKeys = [];

					/* Recreate our object as a subset of the original */
					for (var i = pruneStart; i < m_chp.hiddenKeys.length; i++) {
						var hiddenKey = m_chp.hiddenKeys[i];
						newHiddenKeys.push(hiddenKey);
						newHiddenThings[hiddenKey] = m_chp.allHiddenThings[hiddenKey];
					}
					m_chp.allHiddenThings = newHiddenThings;
					m_chp.hiddenKeys = newHiddenKeys;
					m_chp.syncHiddenThings();
				}

				if (typeof m_chp.allHiddenThings[m_chp.hiddenThingsKey] !== 'undefined') {
					m_chp.hiddenThings = m_chp.allHiddenThings[m_chp.hiddenThingsKey];
					return;
				}
			} catch (e) {}
		}
	},
	addHiddenThing: function(thingId) {
		var i = m_chp.hiddenThings.indexOf(thingId);
		if (i === -1) {
			m_chp.hiddenThings.push(thingId);
		}
		m_chp.syncHiddenThings();
	},
	removeHiddenThing: function(thingId) {
		var i = m_chp.hiddenThings.indexOf(thingId);
		if (i !== -1) {
			m_chp.hiddenThings.splice(i, 1);
		}
		m_chp.syncHiddenThings();
	},
	syncHiddenThings: function() {
		var hidePersistorData;
		m_chp.allHiddenThings[m_chp.hiddenThingsKey] = m_chp.hiddenThings;
		hidePersistorData = {
			'hiddenThings': m_chp.allHiddenThings,
			'hiddenKeys': m_chp.hiddenKeys
		}
		RESStorage.setItem('RESmodules.commentHidePersistor.hidePersistor', JSON.stringify(hidePersistorData));
	},
	hideHiddenThings: function() {
		m_chp.loadHiddenThings();

		for (var i = 0, il = m_chp.hiddenThings.length; i < il; i++) {
			var thingId = m_chp.hiddenThings[i],
				// $hideLink = $('div.id-' + thingId + ':first > div.entry div.noncollapsed a.expand');
				// changed how this is grabbed and clicked due to firefox not working properly with it.
				$hideLink = document.querySelector('div.id-' + thingId + ' > div.entry div.noncollapsed a.expand');
			if ($hideLink) {
				/**
				 * Zero-length timeout to defer this action until after the
				 * other modules have finished. For some reason without
				 * deferring the hide was conflicting with the
				 * commentNavToggle width.
				 **/
				(function($hideLink) {
					window.setTimeout(function() {
						// $hideLink.click();
						RESUtils.click($hideLink);
					}, 0);
				})($hideLink);
			}
		}
	}
};



modules['bitcointip'] = {
	moduleID: 'bitcointip',
	moduleName: 'bitcointip',
	category: 'Users',
	disabledByDefault: true,
	description: 'Send <a href="http://bitcoin.org/" target="_blank">bitcoin</a> to other redditors via ' +
		'<a href="/r/bitcointip" target="_blank">bitcointip</a>. <br><br> For more information, ' +
		'visit <a href="/r/bitcointip" target="_blank">/r/bitcointip</a> or <a href="/13iykn" target="_blank">read the documentation</a>.',
	options: {
		baseTip: {
			name: 'Default Tip',
			type: 'text',
			value: '0.01 BTC',
			description: 'Default tip amount in the form of "[value] [units]", e.g. "0.01 BTC"'
		},
		attachButtons: {
			name: 'Add "tip bitcoins" Button',
			type: 'boolean',
			value: true,
			description: 'Attach "tip bitcoins" button to comments'
		},
		hide: {
			name: 'Hide Bot Verifications',
			type: 'boolean',
			value: true,
			description: 'Hide bot verifications'
		},
		status: {
			name: 'Tip Status Format',
			type: 'enum',
			values: [{
				name: 'detailed',
				value: 'detailed'
			}, {
				name: 'basic',
				value: 'basic'
			}, {
				name: 'none',
				value: 'none'
			}],
			value: 'detailed',
			description: 'Tip status - level of detail'
		},
		currency: {
			name: 'Preferred Currency',
			type: 'enum',
			values: [{
				name: 'BTC',
				value: 'BTC'
			}, {
				name: 'USD',
				value: 'USD'
			}, {
				name: 'JPY',
				value: 'JPY'
			}, {
				name: 'GBP',
				value: 'GBP'
			}, {
				name: 'EUR',
				value: 'EUR'
			}],
			value: 'USD',
			description: 'Preferred currency units'
		},
		balance: {
			name: 'Display Balance',
			type: 'boolean',
			value: true,
			description: 'Display balance'
		},
		subreddit: {
			name: 'Display Enabled Subreddits',
			type: 'boolean',
			value: false,
			description: 'Display enabled subreddits'
		},
		address: {
			name: 'Known User Addresses',
			type: 'table',
			addRowText: '+add address',
			fields: [{
				name: 'user',
				type: 'text'
			}, {
				name: 'address',
				type: 'text'
			}],
			value: [
				/* ['skeeto', '1...'] */
			],
			description: 'Mapping of usernames to bitcoin addresses'
		},
		fetchWalletAddress: {
			text: 'Search private messages',
			description: "Search private messages for bitcoin wallet associated with the current username." + "<p>You must be logged in to search.</p>" + "<p>After clicking the button, you must reload the page to see newly-found addresses.</p>",
			type: 'button',
			callback: null // populated when module loads
		}
	},
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[\?]*/i
	],
	exclude: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[\?]*\/user\/bitcointip\/?/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		this.options.fetchWalletAddress.callback = this.fetchAddressForCurrentUser.bind(this);
		RESUtils.addCSS('.tip-bitcoins { cursor: pointer; }');
		RESUtils.addCSS('.tips-enabled-icon { cursor: help; }');
		RESUtils.addCSS('#tip-menu { display: none; position: absolute; top: 0; left: 0; }');
		// fix weird z-indexing issue caused by reddit's default .dropdown class
		RESUtils.addCSS('.tip-wrapper .dropdown { position: static; }');
	},

	go: function() {
		if (!this.isEnabled() || !this.isMatchURL()) {
			return;
		}

		if (this.options.status.value === 'basic') {
			this.icons.pending = this.icons.completed;
			this.icons.reversed = this.icons.completed;
		}

		if (this.options.subreddit.value) {
			this.attachSubredditIndicator();
		}

		if (this.options.balance.value) {
			this.attachBalance();
		}

		if (RESUtils.currentSubreddit() === 'bitcointip') {
			this.injectBotStatus();
		}

		if (RESUtils.pageType() === 'comments') {
			if (this.options.attachButtons.value) {
				this.attachTipButtons();
				RESUtils.watchForElement('newComments', modules['bitcointip'].attachTipButtons.bind(this));
				this.attachTipMenu();
			}

			if (this.options.hide.value) {
				this.hideVerifications();
				RESUtils.watchForElement('newComments', modules['bitcointip'].hideVerifications.bind(this));
			}

			if (this.options.status.value !== 'none') {
				this.scanForTips();
				RESUtils.watchForElement('newComments', this.scanForTips.bind(this));
			}
		}
	},

	save: function save() {
		var json = JSON.stringify(this.options);
		RESStorage.setItem('RESoptions.bitcoinTip', json);
	},

	load: function load() {
		var json = RESStorage.getItem('RESoptions.bitcoinTip');
		if (json) {
			this.options = JSON.parse(json);
		}
	},


	/** Specifies how to find tips. */
	tipregex: /\+((\/u\/)?bitcointip|bitcoin|tip|btctip|bittip|btc)/i,
	tipregexFun: /(\+((?!0)(\d{1,4})) (point|internet|upcoin))/i,

	/** How many milliseconds until the bot is considered down. */
	botDownThreshold: 15 * 60 * 1000,

	/** Bitcointip API endpoints. */
	api: {
		gettips: '//bitcointip.net/api/gettips.php',
		gettipped: '//bitcointip.net/api/gettipped.php',
		subreddits: '//bitcointip.net/api/subreddits.php',
		balance: '//bitcointip.net/api/balance.php'
	},

	/** Encoded tipping icons. */
	icons: {
		completed: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAMAAABFNRROAAAAt1BMVEX///8AAAAAyAAAuwAAwQcAvAcAvwAAwQYAyAUAxAUAxwQAwgQAvAMAxQYAvwYAxQYAxwU5yT060j460j871T89wUE9wkFGokdGu0hIzExJl09JmE9JxExJxE1K1U9K1k5Ll09LmVNMmVNM2FBNmlRRx1NSzlRTqlVUslZU1ldVq1hVrFdV2FhWrFhX21pZqlphrWJh3WRotGtrqm1stW91sXd2t3h5t3urz6zA2sHA28HG3sf4+PhvgZhQAAAAEXRSTlMAARweJSYoLTM0O0dMU1dYbkVIv+oAAACKSURBVHjaVc7XEoIwEIXhFRED1tBUxBaPFSyxK3n/5zIBb/yv9pudnVky2Ywxm345MHkVXByllPm4W24qrLbzdo1sLPPRepc+XlnSIAuz9DQYPtXnkLhUF/ysrndV3CYLRpbg2VtpxFMwfRfEl8IghEPUhB9t9lEQoke6FnzONfpU5kEIoKOn/z+/pREPWTic38sAAAAASUVORK5CYII=",
		cancelled: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAMAAABFNRROAAAAQlBMVEX///+qAAAAAAC/AADIABSaTU3YMDDcPj7cSEjeUFDiZGTld3fmfHzoiorqkJDqlpbupKTuqqr99fX99/f+/Pz////kWqLlAAAABXRSTlMAAwcIM6KYVMQAAABfSURBVHjaXc7JDsAgCEVRsYpIBzro//9qHyHpond3AgkklIuXPKJcqleIIEB6FwEhQEW0t4rlUtt+22ZTMQ09NqZyiK8BtBCvc9iDWegY526hBVRmdcQ9RgD9f/G+P1+JEwRF2vKhRgAAAABJRU5ErkJggg==",
		tipped: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAANCAMAAACq939wAAAA/FBMVEWqVQCqcQCZZgCLXQCdYgDMjACOXACOXwCacQCfcQCqegCwggChggCnfwCwggCthACtgQC9iACleQC+iwDMlgDJlACmfgDDiwDBjADHlQDJnQDFlQDKmAChfRGjgBOmfhKmghKnghOqhBKthxOviROvjB+vjCGvjCOwiRSwihixixWxjSGziBOzkSmzky+0kSa0kiy3jxW8kxS8mCi8n0i8oEq9lBe9mSvOoBbUrTTUrTjbukXcsTDctDrdtj/exHbexXDfwWXfwmvjrBnksRjksx7lrhnqx17qyWTqymrq377rz3nr2qftuiHtvSv67cD67sj+997/+OX///8rcy1sAAAAHXRSTlMDCQoLDRQkKystMDc5Oj0+QUlKS0tMTVFSV15/i6wTI/gAAACWSURBVHjaHcrnAoFQGADQryI7sjNKN0RKZJVNQ8io938YN+f3ASDp1B9NAhD15UzXNH26KhNQXZyDBxZcNlloKadvFIbR56owUOFV9425ai8PrGwZaITQeisXoKHs7k/MP44ZaHYl54U5El8EdmjNEWbEjesf/Ljd9v0S1ETBtD3PNgUxB8nOQIybOGknAKgMy2FsmoIflIEZdK7PshkAAAAASUVORK5CYII=",
		pending: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAABWUlEQVR4nI2Sy0sCURTGD6S2jjYFrdy0DNpEhokb8zFm5YyaO6NFYNGqF/0hPZYtR79FUbgw0BFtDKIgUCSpv8Od3XtGJzWDBj64h/l+954XdbtdGhQZkzNUd7ptifiXZygo0Wz0WsWoyHTMj4Wo6nRLQ7KdRuZz15bWSiF0GQOVXJ4hqP/COGDTjEO9SyByIcDHiUXiT+QsAaW1wabgi4KtVxVqM4lQVcFx4RS5tzy0vIgZFDVTnaYkFG6us2lbTyNws4ZAMYizwjk6nQ7KbQOJfMqCRBlERZpWruJYfvYigx02ZfUDHN2e8Pnpy8T+w6G4MIqI8HFH5Ut9SKZQ/jDYPAh4K36EGzGrkwz1avK8+/jn3n2WzaPASsNnQaJpvYG65ixwFV7Dj7iuQcul+Cwvs4Ga1fafOVUcC31Qpio1BJjO0PiNEJPn9osapeyNqLmW/lyj/+7eN1qRZT0kKLSqAAAAAElFTkSuQmCC",
		reversed: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAABOklEQVR42p2SvU4CQRSFj+9h7DQ2VmsDCy0/Cw2wsNtuRwixIiQ8CZaWGDBaaAiJyVAg2xi1AaTQ19jyOHeSIbLBxuIkM7Pn23PvnQHJPSngNAYcK9mnPWng/LpaZVoadg9CC+BSDNsg4FcU7bRpNjkslaiAYAfZhL+AuFbjQ6PBYaXCZ6AK4Mj0IMBGH4rptVjkW73Ote9zUS5z2u/zfTzmRBL1XoNniIFjgdaeZ0yjMORNocCZ1nQwYJIk3CrFSatlIGkDM+BEouNMhndRZEyjTof3vZ5Zfy+XfOp2zQ+ND3BMkoWkhE+lxLwHzPN5rjzPTtLZ9fSRzZqPj+22MaeBlesaSIZmp3dhQZXLcaQHcev7sjZnFngBwr17mgNFC+pSRRawZV0dfBFy89ogDYvEbBMav33/ens/XHaDp7U/bFsAAAAASUVORK5CYII="
	},

	/** Specifies how to display different currencies. */
	currencies: {
		USD: {
			unit: 'US$',
			precision: 2
		},
		BTC: {
			unit: '฿'
		},
		JPY: {
			unit: '¥'
		},
		GBP: {
			unit: '£',
			precision: 2
		},
		EUR: {
			unit: '€',
			precision: 2
		},
		AUD: {
			unit: 'A$',
			precision: 2
		},
		CAD: {
			unit: 'C$',
			precision: 2
		}
	},

	/** Return a DOM element to separate items in the user bar. */
	separator: function() {
		return $('<span>|</span>').addClass('separator');
	},

	/** Convert a quantity into a string. */
	quantityString: function quantityString(object) {
		var pref = this.options.currency.value.toUpperCase();
		var unit = this.currencies[pref];
		var amount = object['amount' + pref] || object['balance' + pref];
		if (amount == null) {
			amount = object['amountBTC'] || object['balanceBTC'];
			unit = this.currencies['BTC'];
		}
		if (unit.precision) {
			amount = parseFloat(amount).toFixed(unit.precision);
		}
		return unit.unit + amount;
	},

	tipPublicly: function tipPublicly($target) {
		var form = null;
		if ($target.closest('.link').length > 0) { /* Post */
			form = $('.commentarea .usertext:first');
		} else { /* Comment */
			var replyButton = $target.closest('ul').find('a[onclick*="reply"]');
			RESUtils.click(replyButton[0]);
			form = $target.closest('.thing').find('FORM.usertext.cloneable:first');
		}
		var textarea = form.find('textarea');
		if (!this.tipregex.test(textarea.val())) {
			textarea.val(textarea.val() + '\n\n+/u/bitcointip ' + this.options.baseTip.value);
			RESUtils.setCursorPosition(textarea, 0);
		}
	},

	tipPrivately: function tipPrivately($target) {
		var form = null;
		if ($target.closest('.link').length > 0) { /* Post */
			form = $('.commentarea .usertext:first');
		} else {
			form = $target.closest('.thing').find(".child .usertext:first");
		}
		if (form.length > 0 && form.find('textarea').val()) {
			/* Confirm if a comment has been entered. */
			if (!confirm('Really leave this page to tip privately?')) {
				return;
			}
		}
		var user = $target.closest('.thing').find('.author:first').text();
		var msg = encodeURIComponent('+/u/bitcointip @' + user + ' ' + this.options.baseTip.value);
		var url = '/message/compose?to=bitcointip&subject=Tip&message=' + msg;
		window.location = url;
	},

	attachTipButtons: function attachTipButtons(ele) {
		ele = ele || document.body;
		var module = this;
		if (!module.tipButton) {
			module.tipButton = $(
				'<div class="tip-wrapper">' +
				'<div class="dropdown">' +
				'<a class="tip-bitcoins login-required noCtrlF" title="Click to give a bitcoin tip" data-text="bitcointip"></a>' +
				'</div>' +
				'</div>');
			module.tipButton.on('click', function(e) {
				modules['bitcointip'].toggleTipMenu(e.target);
			});
		}

		/* Add the "tip bitcoins" button after "give gold". */
		var allGiveGoldLinks = ele.querySelectorAll('a.give-gold');
		RESUtils.forEachChunked(allGiveGoldLinks, 15, 1000, function(giveGold, i, array) {
			$(giveGold).parent().after($('<li/>')
				.append(modules['bitcointip'].tipButton.clone(true)));
		});

		if (!module.attachedPostTipButton) {
			module.attachedPostTipButton = true; // signifies either "attached button" or "decided not to attach button"

			if (!RESUtils.isCommentPermalinkPage() && $('.link').length === 1) {
				// Viewing full comments on a submission, so user can comment on post
				$('.link ul.buttons .share').after($('<li/>')
					.append(modules['bitcointip'].tipButton.clone(true)));
			}
		}
	},

	attachTipMenu: function() {
		this.tipMenu =
			$('<div id="tip-menu" class="drop-choices">' +
				'<a class="choice tip-publicly" href="javascript:void(0);">tip publicly</a>' +
				'<a class="choice tip-privately" href="javascript:void(0);">tip privately</a>' +
				'</div>');

		if (modules['settingsNavigation']) { // affordance for userscript mode
			this.tipMenu.append(
				modules['settingsNavigation'].makeUrlHashLink(this.moduleID, null,
					'<img src="' + this.icons.tipped + '"> bitcointip', 'choice')
			);
		}
		$(document.body).append(this.tipMenu);

		this.tipMenu.find('a').click(function(event) {
			modules['bitcointip'].toggleTipMenu();
		});

		this.tipMenu.find('.tip-publicly').click(function(event) {
			event.preventDefault();
			modules['bitcointip'].tipPublicly($(modules['bitcointip'].lastToggle));
		});

		this.tipMenu.find('.tip-privately').click(function(event) {
			event.preventDefault();
			modules['bitcointip'].tipPrivately($(modules['bitcointip'].lastToggle));
		});
	},


	toggleTipMenu: function(ele) {
		var tipMenu = modules['bitcointip'].tipMenu;

		if (!ele || ele.length === 0) {
			tipMenu.hide();
			return;
		}

		var thisXY = $(ele).offset();
		var thisHeight = $(ele).height();
		// if already visible and we've clicked a different trigger, hide first, then show after the move.
		if ((tipMenu.is(':visible')) && (modules['bitcointip'].lastToggle !== ele)) {
			tipMenu.hide();
		}
		tipMenu.css({
			top: (thisXY.top + thisHeight) + 'px',
			left: thisXY.left + 'px'
		});
		tipMenu.toggle();
		modules['bitcointip'].lastToggle = ele;
	},

	attachSubredditIndicator: function() {
		var subreddit = RESUtils.currentSubreddit();
		if (subreddit && this.getAddress(RESUtils.loggedInUser())) {
			$.getJSON(this.api.subreddits, function(data) {
				if (data.subreddits.indexOf(subreddit.toLowerCase()) !== -1) {
					$('#header-bottom-right form.logout')
						.before(this.separator()).prev()
						.before($('<img/>').attr({
							'src': this.icons.tipped,
							'class': 'tips-enabled-icon',
							'style': 'vertical-align: text-bottom;',
							'title': 'Tips enabled in this subreddit.'
						}));
				}
			}.bind(this));
		}
	},

	hideVerifications: function hideVerifications(ele) {
		ele = ele || document.body;

		/* t2_7vw3n is u/bitcointip. */

		var botComments = $(ele).find('a.id-t2_7vw3n').closest('.comment');
		RESUtils.forEachChunked(botComments, 15, 1000, function(botComment, i, array) {
			var $this = $(botComment);
			var isTarget = $this.find('form:first').hasClass('border');
			if (isTarget) return;

			var hasReplies = $this.find('.comment').length > 0;
			if (hasReplies) return;

			$this.find('.expand').eq(2).click();
		});
	},

	toggleCurrency: function() {
		var units = Object.keys(this.currencies);
		var i = (units.indexOf(this.options.currency.value) + 1) % units.length;
		this.options.currency.value = units[i];
		this.save();
	},

	getAddress: function getAddress(user) {
		user = user || RESUtils.loggedInUser();
		var address = null;
		this.options.address.value.forEach(function(row) {
			if (row[0] === user) address = row[1];
		});
		return address;
	},

	setAddress: function setAddress(user, address) {
		user = user || RESUtils.loggedInUser();
		var set = false;
		this.options.address.value.forEach(function(row) {
			if (row[0] === user) {
				row[1] = address;
				set = true;
			}
		});
		if (user && !set) {
			this.options.address.value.push([user, address]);
		}
		this.save();
		return address;
	},

	attachBalance: function attachBalance() {
		var user = RESUtils.loggedInUser();
		var address = this.getAddress(user);
		if (!address) return;
		var bitcointip = this;

		$.getJSON(this.api.balance, {
			username: user,
			address: address
		}, function(balance) {
			if (!('balanceBTC' in balance)) {
				return; /* Probably have the address wrong! */
			}
			$('#header-bottom-right form.logout')
				.before(bitcointip.separator()).prev()
				.before($('<a/>').attr({
					'class': 'hover',
					'href': '#'
				}).click(function() {
					bitcointip.toggleCurrency();
					$(this).text(bitcointip.quantityString(balance));
				}).text(bitcointip.quantityString(balance)));
		});
	},

	fetchAddressForCurrentUser: function() {
		var user = RESUtils.loggedInUser();
		if (!user) {
			modules['notifications'].showNotification({
				moduleID: 'bitcointip',
				optionKey: 'fetchWalletAddress',
				type: 'error',
				message: 'Log in, then try again.'
			});
			return;
		}
		this.fetchAddress(user, function(address) {
			if (address) {
				modules['bitcointip'].setAddress(user, address);
				modules['notifications'].showNotification({
					moduleID: 'bitcointip',
					optionKey: 'address',
					message: 'Found address ' + address + ' for user ' + user + '<br><br>Your adress will appear in RES settings after you refresh the page.'
				});
			} else {
				modules['notifications'].showNotification({
					moduleID: 'bitcointip',
					type: 'error',
					message: 'Could not find address for user ' + user
				});
			}

		});
		modules['notifications'].showNotification({
			moduleID: 'bitcointip',
			optionKey: 'fetchWalletAddress',
			message: 'Searching your private messages for a bitcoin wallet address. ' + '<br><br>Reload the page to see if a wallet was found.'
		});
	},

	fetchAddress: function fetchAddress(user, callback) {
		user = user || RESUtils.loggedInUser();
		callback = callback || function nop() {};
		if (!user) return;
		$.getJSON('/message/messages.json', function(messages) {
			/* Search messages for a bitcointip response. */
			var address = messages.data.children.filter(function(message) {
				return message.data.author === 'bitcointip';
			}).map(function(message) {
				var pattern = /Deposit Address: \| \[\*\*([a-zA-Z0-9]+)\*\*\]/;
				var address = message.data.body.match(pattern);
				if (address) {
					return address[1];
				} else {
					return false;
				}
			}).filter(function(x) {
				return x;
			})[0]; // Use the most recent
			if (address) {
				this.setAddress(user, address);
				callback(address);
			} else {
				callback(null);
			}
		}.bind(this));
	},

	scanForTips: function(ele) {
		ele = ele || document.body;
		var tips = this.getTips(this.tipregex, ele);
		var fun = this.getTips(this.tipregexFun, ele);
		var all = $.extend({}, tips, fun);
		if (Object.keys(all).length > 0) {
			this.attachTipStatuses(all);
			this.attachReceiverStatus(this.getTips(/(?:)/, ele));
		}
	},

	/** Return true if the comment node matches the regex. */
	commentMatches: function(regex, $e) {
		return $e.find('.md:first, .title:first').children().is(function() {
			return regex.test($(this).text());
		});
	},

	/** Find all things matching a regex. */
	getTips: function getComments(regex, ele) {
		var tips = {};
		var items = $(ele);
		if (items.is('.entry')) {
			items = items.closest('div.comment, div.self, div.link');
		} else {
			items = items.find('div.comment, div.self, div.link');
		}
		var module = this;
		items.each(function() {
			var $this = $(this);
			if (module.commentMatches(regex, $this)) {
				var id = $this.data('fullname');
				// if id is null, this may be a deleted comment...
				if (id) {
					tips[id.replace(/^t._/, '')] = $this;
				}
			}
		});
		return tips;
	},

	attachTipStatuses: function attachTipStatuses(tips) {
		var iconStyle = 'vertical-align: text-bottom; margin-left: 8px;';
		var icons = this.icons;
		var tipIDs = Object.keys(tips);
		$.getJSON(this.api.gettips, {
			tips: tipIDs.toString()
		}, function(response) {
			var lastEvaluated = new Date(response.last_evaluated * 1000);
			response.tips.forEach(function(tip) {
				var id = tip.fullname.replace(/^t._/, '');
				var tagline = tips[id].find('.tagline').first();
				var icon = $('<a/>').attr({
					href: tip.tx,
					target: '_blank'
				});
				tagline.append(icon.append($('<img/>').attr({
					src: icons[tip.status],
					style: iconStyle,
					title: this.quantityString(tip) + ' → ' + tip.receiver + ' (' + tip.status + ')'
				})));
				tips[id].attr('id', 't1_' + id); // for later linking
				delete tips[id];
			}.bind(this));

			/* Deal with unanswered tips. */
			for (var id in tips) {
				if (this.commentMatches(this.tipregexFun, tips[id])) {
					continue; // probably wasn't actually a tip
				}
				var date = tips[id].find('.tagline time:first')
					.attr('datetime');
				if (new Date(date) < lastEvaluated) {
					var tagline = tips[id].find('.tagline:first');
					tagline.append($('<img/>').attr({
						src: icons.cancelled,
						style: iconStyle,
						title: 'This tip is invalid.'
					}));
				}
			}
		}.bind(this));
	},

	attachReceiverStatus: function attachReceiverStatus(things) {
		var iconStyle = 'vertical-align: text-bottom; margin-left: 8px;';
		var icons = this.icons;
		var thingIDs = Object.keys(things);
		$.getJSON(this.api.gettipped, {
			tipped: thingIDs.toString()
		}, function(response) {
			response.forEach(function(tipped) {
				var id = tipped.fullname.replace(/^t._/, '');
				var thing = things[id];
				var tagline = thing.find('.tagline').first();
				var plural = tipped.tipQTY > 1;
				var title = this.quantityString(tipped) + ' to ' +
					thing.find('.author:first').text() + ' for this ';
				if (plural) {
					title = 'redditors have given ' + title;
				} else {
					title = 'a redditor has given ' + title;
				}
				if (thing.closest('.link').length === 0) {
					title += 'comment.';
				} else {
					title += 'submission.';
				}
				var icon = $('<img/>').attr({
					src: icons.tipped,
					style: iconStyle,
					title: title
				});
				tagline.append(icon);
				if (plural) {
					tagline.append($('<span/>').text('x' + tipped.tipQTY));
				}
			}.bind(this));
		}.bind(this));
	},

	injectBotStatus: function injectBotStatus() {
		$.getJSON(this.api.gettips, function(response) {
			var lastEvaluated = new Date(response.last_evaluated * 1000);
			var botStatus = null;
			if (Date.now() - lastEvaluated > this.botDownThreshold) {
				botStatus = '<span class="status-down">DOWN</span>';
			} else {
				botStatus = '<span class="status-up">UP</span>';
			}
			$('.side a[href="http://bitcointip.net/status.php"]').html(botStatus);
		});
	}
};

modules['troubleShooter'] = {
	moduleID: 'troubleShooter',
	moduleName: 'Troubleshooter',
	category: 'Troubleshoot',
	options: {
		clearUserInfoCache: {
			type: 'button',
			text: 'Clear',
			callback: null,
			description: 'Reset the <code>userInfo</code> cache for the currently logged in user. Useful for when link/comment karma appears to have frozen.'
		},
		clearSubreddits: {
			type: 'button',
			text: 'Clear',
			callback: null,
			description: 'Reset the \'My Subreddits\' dropdown contents in the event of old/duplicate/missing entries.'
		},
		clearTags: {
			type: 'button',
			text: 'Clear',
			callback: null,
			description: 'Remove all entries for users with +1 or -1 vote tallies (only non-tagged users).'
		},
		resetToFactory: {
			type: 'button',
			text: 'Reset',
			callback: null,
			description: 'Warning: This will remove all your RES settings, including tags, saved comments, filters etc!'
		}
	},
	description: 'Resolve common problems and clean/clear unwanted settings data.' + '<br/><br/>' + 'Your first line of defence against browser crashes/updates, or potential issues' + ' with RES, is a frequent backup.' + '<br/><br/>' + 'See <a href="http://www.reddit.com/r/Enhancement/wiki/where_is_res_data_stored">here</a>' + ' for the location of the RES settings file for your browser/OS.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[\?]*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		var css = '';
		css += 'body:not(.loggedin) #clearUserInfoCache ~ .optionDescription:before, body:not(.loggedin) #clearSubreddits ~ .optionDescription:before';
		css += '{content: "Functionality only for logged in users - ";color:#f00;font-weight:bold}';
		RESUtils.addCSS(css);
	},
	go: function() {
		this.options['clearUserInfoCache'].callback = modules['troubleShooter'].clearUICache;
		this.options['clearSubreddits'].callback = modules['troubleShooter'].clearSubreddits;
		this.options['clearTags'].callback = modules['troubleShooter'].clearTags;
		this.options['resetToFactory'].callback = modules['troubleShooter'].resetToFactory;
	},
	clearUICache: function() {
		var user = RESUtils.loggedInUser();
		if (user) {
			RESStorage.removeItem('RESUtils.userInfoCache.' + user);
			modules['notifications'].showNotification('Cached info for ' + user + ' was reset.', 2500);
		} else {
			modules['notifications'].showNotification('You must be logged in to perform this task.', 2500);
		}
	},
	clearSubreddits: function() {
		var user = RESUtils.loggedInUser();
		if (user) {
			RESStorage.removeItem('RESmodules.subredditManager.subreddits.' + user);
			modules['notifications'].showNotification('Subreddits for ' + user + ' were reset.', 2500);
		} else {
			modules['notifications'].showNotification('You must be logged in to perform this task.', 2500);
		}
	},
	clearTags: function() {
		var confirm = window.confirm('Are you positive?');
		if (confirm) {
			var i,
				cnt = 0,
				tags = RESStorage.getItem('RESmodules.userTagger.tags');
			if (tags) {
				tags = JSON.parse(tags);
				for (i in tags) {
					if ((tags[i].votes === 1 || tags[i].votes === -1) && !tags[i].hasOwnProperty('tag')) {
						delete tags[i];
						cnt += 1;
					}
				}
				tags = JSON.stringify(tags);
				RESStorage.setItem('RESmodules.userTagger.tags', tags);
				modules['notifications'].showNotification(cnt + ' entries removed.', 2500);
			}
		} else {
			modules['notifications'].showNotification('No action was taken', 2500);
		}
	},
	resetToFactory: function() {
		var confirm = window.confirm('This will kill all your settings and saved data. Are you sure?');
		if (confirm) {
			for (var key in RESStorage) {
				if (key.indexOf('RES') !== -1) {
					RESStorage.removeItem(key);
				}
			}
			modules['notifications'].showNotification('All settings reset.', 2500);
		} else {
			modules['notifications'].showNotification('No action was taken', 2500);
		}
	}
};


/*
modules['snoonet'] = {
	moduleID: 'snoonet',
	moduleName: 'Snoonet IRC',
	category: 'UI',
	options: {
	},
	description: 'Module to simplify adding snoonet IRC support to your subreddit(s)',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[\w]+\/?(?:\??[\w]+=[\w]+&?)*$/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		// TODO: maybe don't depend on their sprite sheet?
		var css = '.icon-menu #enableSnoonet:before {';
		css += 'background-image: url(https://redditstatic.s3.amazonaws.com/sprite-reddit.hV9obzo72Pc.png);';
		css += 'background-position: 0px -708px;';
		css += 'background-repeat: no-repeat;';
		css += 'height: 16px;';
		css += 'width: 16px;';
		css += 'display: block;';
		css += 'content: " ";';
		css += 'float: left;';
		css += 'margin-right: 5px;';
		css += '}';
		RESUtils.addCSS(css);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if ($('body').hasClass('moderator')) {
				// if there's not yet a link to chat in the sidebar, add an item to the moderation tools box.
				var chatLink = $('.side .usertext-body').find('a[href*="webchat.snoonet.org"]');
				if (chatLink.length === 0) {
					$('#moderation_tools ul.flat-vert').prepend('<li><a id="enableSnoonet" target="_blank" href="http://api.snoonet.org/reddit/">Enable Live Chat</a> <a id="enableSnoonetHelp" title="what\'s this?" target="_blank" href="/r/Enhancement/wiki/enablechat">(?)</a></li>');
				}
			}
		}
	}
};
*/

/* END MODULES */

var lastPerf = 0;

function perfTest(name) {
	var now = Date.now();
	var diff = now - lastPerf;
	console.log(name + ' executed. Diff since last: ' + diff + 'ms');
	lastPerf = now;
}
