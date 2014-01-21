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
