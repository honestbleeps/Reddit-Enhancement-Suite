/* jshint esnext: true */
/* global require: false */

// suppress annoying strict warnings that cfx overrides and turns on
// comment this line out for releases.
// require('sdk/preferences/service').set('javascript.options.strict', false);

// Import the APIs we need.
let pageMod = require('sdk/page-mod');
let Request = require('sdk/request').Request;
let self = require('sdk/self');
let tabs = require('sdk/tabs');
let priv = require('sdk/private-browsing');
let windows = require('sdk/windows').browserWindows;
let viewFor = require('sdk/view/core').viewFor;

let { ToggleButton } = require('sdk/ui/button/toggle'),
	styleSheetButton;

// require chrome allows us to use XPCOM objects...
const {Cc,Ci,Cu,components} = require('chrome');
let historyService = Cc['@mozilla.org/browser/history;1'].getService(Ci.mozIAsyncHistory);


// Cookie manager for new API login
let cookieManager = Cc['@mozilla.org/cookiemanager;1'].getService().QueryInterface(Ci.nsICookieManager2);
components.utils.import('resource://gre/modules/NetUtil.jsm');

// Preferences
let prefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefBranch);

// this function takes in a string (and optional charset, paseURI) and creates an nsURI object, which is required by historyService.addURI...
function makeURI(aURL, aOriginCharset, aBaseURI) {
	let ioService = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
	return ioService.newURI(aURL, aOriginCharset, aBaseURI);
}

let workers = [];
function detachWorker(worker, workerArray) {
	let index = workerArray.indexOf(worker);
	if (index !== -1) {
		workerArray.splice(index, 1);
	}
}

function RESStorage() {
	if (!this instanceof RESStorage) return new RESStorage();
	let module = this;
	init(module);
	return module;

	function init(module) {
		let storage = {};
		module._storage = storage;
	}
}

RESStorage.prototype.getItems = function() {
	var values = {};
	for (var key in this._storage) {
		if (!this._storage.hasOwnProperty(key)) continue;
		values[key] = this._storage[key];
	}

};

RESStorage.prototype.getItem = function(key) {
	return this._storage[key];
};

RESStorage.prototype.setItems = function (values) {
	for (var key in values) {
		if (!values.hasOwnProperty(key)) continue;
		this._storage[key] = values[key];
	}
};
RESStorage.prototype.setItem = function(key, value) {
	this._storage[key] = value;
}
RESStorage.prototype.removeItem = function(key) {
	delete this._storage[key];
};

RESSQLiteStorage.prototype = new RESStorage();
function RESSQLiteStorage() {
	if (!this instanceof RESSQLiteStorage) return new RESSQLiteStorage();
	let module = this;
	init(module);
	return module;

	function init(module) {
		let debug = false;

		let schema = {
			tables: {
				'storage': 'key   TEXT PRIMARY KEY, \
	                		value    TEXT'
	    	}
	    };

		let connection, initialized;

		module.load = function() {
			if (initialized) return;

			var newFile = initializeFile();

			initialized = true;
			return newFile;
		}

		module.getItems = getItems;
		module.getItem = getItem;
		module.setItems = setItems;
		module.setItem = setItem;
		module.removeItem = removeItem;


		function getItems() {
			let values = {},
				key, value,
				statement = connection.createStatement('SELECT key, value FROM storage');

			while (statement.executeStep()) {
				key = statement.row['key'];
				value = statement.row['value'];
				values[key] = value;
			}

			if (debug) console.log('storage.getItems: ' + Object.getOwnPropertyNames(values).length);
			return values;
		}

		function getItem(key) {
			let value = '',
				result,
				statement = connection.createStatement('SELECT value FROM storage WHERE key = :key');

			statement.params['key'] = key;
			result = statement.executeStep();
			if (result) {
				value = statement.row['value'];
			}

			if (debug) console.log('storage.getItem: ' + key + ' => ' + value);
			return value;
		}

		function setItems(values) {
			if (!(values && Object.getOwnPropertyNames(values).length)) return;

			let key, value;


			connection.beginTransaction();
			for (key in values) {
				value = values[key];
				module.setItem(key, value);
			}
			connection.commitTransaction();

		};

		function setItem(key, value) {
			let statement = connection.createStatement('INSERT OR REPLACE INTO storage (key, value) values (:key, :value);');
			statement.params['key'] = key;
			statement.params['value'] = value;
			statement.executeStep();


			if (debug) console.log('storage.setItem: ' + key + ' <= ' + value);
		}


		function removeItem(key) {
			let statement = connection.createStatement('DELETE FROM storage WHERE key = :key');
			statement.params['key'] = key;
			statement.executeStep();
		}


	  	function initializeFile() {
			let dirService, dbService, dbFile, newDbFile; // not connection!
			dirService = Cc['@mozilla.org/file/directory_service;1'].getService(Ci.nsIProperties);
			dbService = Cc['@mozilla.org/storage/service;1'].getService(Ci.mozIStorageService);
			dbFile = dirService.get('ProfD', Ci.nsIFile); dbFile.append('res.sqlite');
			newDbFile = !dbFile.exists();

			connection = dbService.openDatabase(dbFile);

			if (newDbFile) {
		    	createTables();
		    }
	  	}

	  function createTables() {
	    for (let name in schema.tables) {
	    	let table = schema.tables[name];
			connection.createTable(name, table);
		 }
	  }

	}
}


RESSimpleStorage.prototype = new RESStorage();
function RESSimpleStorage() {
	if (!this instanceof RESSimpleStorage) return new RESSimpleStorage();
	let module = this;
	init(module);
	return module;

	function init(module) {
		module._storage = require('sdk/simple-storage').storage;
	}
}



let localStorage, sqliteStorage;
localStorage = sqliteStorage = new RESSQLiteStorage();


if (sqliteStorage.load()) {
	// sqlite contains data, so update backup storage
	let simpleStorage = new RESSimpleStorage();
	let backup = sqliteStorage.getItems();
	simpleStorage.setItems(backup);
} else {
	// sqlite empty, so populate from legacy storage
	let simpleStorage = new RESSimpleStorage();
	let backup = simpleStorage.getItems();
	sqliteStorage.setItems(backup);
}



let XHRCache = {
	forceCache: false,
	capacity: 250,
	entries: {},
	count: 0,
	check: function(key) {
		if (key in this.entries) {
//			console.log('hit');
			this.entries[key].hits++;
			return this.entries[key].data;
		} else {
//			console.log('miss');
			return null;
		}
	},
	add: function(key, value) {
		if (key in this.entries) {
			return;
		} else {
//			console.log('add');
			this.entries[key] = {data: value, timestamp: Date.now(), hits: 1};
			this.count++;
		}
		if (this.count > this.capacity) {
			this.prune();
		}
	},
	prune: function() {
		let now = Date.now();
		let bottom = [];
		for (let key in this.entries) {
//			if (this.entries[key].hits === 1) {
//				delete this.entries[key];
//				this.count--;
//				continue;
//			}

			//Weight by hits/age which is similar to reddit's hit/controversial sort orders
			bottom.push({
				key: key,
				weight: this.entries[key].hits/(now - this.entries[key].timestamp)
			});
		}
		bottom.sort(function(a,b){return a.weight-b.weight;});
		let count = this.count - Math.floor(this.capacity / 2);
		for (let i = 0; i < count; i++) {
			delete this.entries[bottom[i].key];
			this.count--;
		}
//		console.log('prune');
	},
	clear: function() {
		this.entries = {};
		this.count = 0;
	}
};
tabs.on('activate', function() {
	// find this worker...
	let worker = getActiveWorker();
	if (worker) {
		worker.postMessage({ name: 'getLocalStorage', message: localStorage.getItems() });
		worker.postMessage({ name: 'subredditStyle', message: 'refreshState' });
	}
});

function getActiveWorker() {
	let tab = tabs.activeTab;
	for (let i in workers) {
		if ((typeof workers[i].tab !== 'undefined') && (tab.title === workers[i].tab.title)) {
			return workers[i];
		}
	}
	return null;
}

function openTab(options) {
	let nsWindow = viewFor(tabs.activeTab.window);
	if ('TreeStyleTabService' in nsWindow) {
		let nsTab = viewFor(tabs.activeTab);
		nsWindow.TreeStyleTabService.readyToOpenChildTab(nsTab);
	}

	tabs.open(options);
}

pageMod.PageMod({
	include: ['*.reddit.com'],
	contentScriptWhen: 'start',
	contentScriptFile: [
		self.data.url('vendor/jquery-1.11.1.min.js'),
		self.data.url('vendor/guiders-1.2.8.js'),
		self.data.url('vendor/jquery.dragsort-0.6.js'),
		self.data.url('vendor/jquery-fieldselection.min.js'),
		self.data.url('vendor/favico.js'),
		self.data.url('vendor/jquery.tokeninput.js'),
		self.data.url('vendor/HTMLPasteurizer.js'),
		self.data.url('vendor/snuownd.js'),
		self.data.url('core/utils.js'),
		self.data.url('browsersupport.js'),
		self.data.url('browsersupport-firefox.js'),
		self.data.url('core/console.js'),
		self.data.url('core/alert.js'),
		self.data.url('core/migrate.js'),
		self.data.url('core/storage.js'),
		self.data.url('core/template.js'),
		self.data.url('vendor/konami.js'),
		self.data.url('vendor/mediacrush.js'),
		self.data.url('vendor/gfycat.js'),
		self.data.url('vendor/gifyoutube.js'),
		self.data.url('vendor/imgurgifv.js'),
		self.data.url('vendor/hogan-3.0.2.js'),
		self.data.url('reddit_enhancement_suite.user.js'),
		self.data.url('modules/submitIssue.js'),
		self.data.url('modules/betteReddit.js'),
		self.data.url('modules/userTagger.js'),
		self.data.url('modules/keyboardNav.js'),
		self.data.url('modules/commandLine.js'),
		self.data.url('modules/about.js'),
		self.data.url('modules/hover.js'),
		self.data.url('modules/subredditTagger.js'),
		self.data.url('modules/singleClick.js'),
		self.data.url('modules/commentPreview.js'),
		self.data.url('modules/commentTools.js'),
		self.data.url('modules/sourceSnudown.js'),
		self.data.url('modules/sortCommentsTemporarily.js'),
		self.data.url('modules/usernameHider.js'),
		self.data.url('modules/showImages.js'),
		self.data.url('modules/showKarma.js'),
		self.data.url('modules/hideChildComments.js'),
		self.data.url('modules/showParent.js'),
		self.data.url('modules/neverEndingReddit.js'),
		self.data.url('modules/saveComments.js'),
		self.data.url('modules/userHighlight.js'),
		self.data.url('modules/nightMode.js'),
		self.data.url('modules/styleTweaks.js'),
		self.data.url('modules/userbarHider.js'),
		self.data.url('modules/accountSwitcher.js'),
		self.data.url('modules/filteReddit.js'),
		self.data.url('modules/newCommentCount.js'),
		self.data.url('modules/spamButton.js'),
		self.data.url('modules/commentNavigator.js'),
		self.data.url('modules/subredditManager.js'),
		self.data.url('modules/RESTips.js'),
		self.data.url('modules/settingsNavigation.js'),
		self.data.url('modules/dashboard.js'),
		self.data.url('modules/notifications.js'),
		self.data.url('modules/subredditInfo.js'),
		self.data.url('modules/commentHidePersistor.js'),
		self.data.url('modules/troubleshooter.js'),
		self.data.url('modules/localDate.js'),
		self.data.url('modules/context.js'),
		self.data.url('modules/noParticipation.js'),
		self.data.url('modules/searchHelper.js'),
		self.data.url('modules/logoLink.js'),
		self.data.url('modules/voteEnhancements.js'),
		self.data.url('modules/tableTools.js'),
		self.data.url('modules/modhelper.js'),
		self.data.url('modules/quickMessage.js'),
		self.data.url('core/init.js')
	],
	contentStyleFile: [
		self.data.url('modules/nightmode.css'),
		self.data.url('modules/commentBoxes.css'),
		self.data.url('core/res.css'),
		self.data.url('vendor/players.css'),
		self.data.url('vendor/guiders.css'),
		self.data.url('vendor/tokenize.css'),
		self.data.url('core/batch.css')
	],
	onAttach: function(worker) {
		// when a tab is activated, repopulate localStorage so that changes propagate across tabs...
		workers.push(worker);
		worker.on('detach', function () {
			detachWorker(this, workers);
		});
		worker.on('message', function(data) {
			let request = data,
				inBackground = prefs.getBoolPref('browser.tabs.loadInBackground') || true,
				isPrivate, thisLinkURL;

			switch (request.requestType) {
				case 'readResource':
					let fileData = self.data.load(request.filename);
					worker.postMessage({ name: 'readResource', data: fileData, transaction: request.transaction });
					break;
				case 'deleteCookie':
					cookieManager.remove('.reddit.com', request.cname, '/', false);
					worker.postMessage({removedCookie: request.cname});
					break;
				case 'ajax':
					let responseObj = {
						XHRID: request.XHRID,
						name: request.requestType
					};
					if (request.aggressiveCache || XHRCache.forceCache) {
						let cachedResult = XHRCache.check(request.url);
						if (cachedResult) {
							responseObj.response = cachedResult;
							worker.postMessage(responseObj);
							return;
						}
					}
					if (request.method === 'POST') {
						Request({
							url: request.url,
							onComplete: function(response) {
								responseObj.response = {
									responseText: response.text,
									status: response.status
								};
								//Only cache on HTTP OK and non empty body
								if ((request.aggressiveCache || XHRCache.forceCache) && (response.status === 200 && response.text)) {
									XHRCache.add(request.url, responseObj.response);
								}
								worker.postMessage(responseObj);
							},
							headers: request.headers,
							content: request.data
						}).post();
					} else {
						Request({
							url: request.url,
							onComplete: function(response) {
								responseObj.response = {
									responseText: response.text,
									status: response.status
								};
								if ((request.aggressiveCache || XHRCache.forceCache) && (response.status === 200 && response.text)) {
									XHRCache.add(request.url, responseObj.response);
								}
								worker.postMessage(responseObj);
							},
							headers: request.headers,
							content: request.data
						}).get();
					}

					break;
				case 'singleClick':
					inBackground = ((request.button === 1) || (request.ctrl === 1));
					isPrivate = priv.isPrivate(windows.activeWindow);

					// handle requests from singleClick module
					if (request.openOrder === 'commentsfirst') {
						// only open a second tab if the link is different...
						if (request.linkURL !== request.commentsURL) {
							openTab({url: request.commentsURL, inBackground: inBackground, isPrivate: isPrivate });
						}
						openTab({url: request.linkURL, inBackground: inBackground, isPrivate: isPrivate });
					} else {
						openTab({url: request.linkURL, inBackground: inBackground, isPrivate: isPrivate });
						// only open a second tab if the link is different...
						if (request.linkURL !== request.commentsURL) {
							openTab({url: request.commentsURL, inBackground: inBackground, isPrivate: isPrivate });
						}
					}
					worker.postMessage({status: 'success'});
					break;
				case 'keyboardNav':
					inBackground = (request.button === 1);
					isPrivate = priv.isPrivate(windows.activeWindow);

					// handle requests from keyboardNav module
					thisLinkURL = request.linkURL;
					if (thisLinkURL.toLowerCase().substring(0, 4) !== 'http') {
						thisLinkURL = (thisLinkURL.substring(0, 1) === '/') ? 'http://www.reddit.com' + thisLinkURL : location.href + thisLinkURL;
					}
					// Get the selected tab so we can get the index of it.  This allows us to open our new tab as the 'next' tab.
					openTab({url: thisLinkURL, inBackground: inBackground, isPrivate: isPrivate });
					worker.postMessage({status: 'success'});
					break;
				case 'openLinkInNewTab':
					inBackground = (request.focus !== true);
					isPrivate = priv.isPrivate(windows.activeWindow);

					thisLinkURL = request.linkURL;
					if (thisLinkURL.toLowerCase().substring(0, 4) !== 'http') {
						thisLinkURL = (thisLinkURL.substring(0, 1) === '/') ? 'http://www.reddit.com' + thisLinkURL : location.href + thisLinkURL;
					}
					// Get the selected tab so we can get the index of it.  This allows us to open our new tab as the 'next' tab.
					openTab({url: thisLinkURL, inBackground: inBackground, isPrivate: isPrivate });
					worker.postMessage({status: 'success'});
					break;
				case 'loadTweet':
					Request({
						url: request.url,
						onComplete: function(response) {
							let resp = JSON.parse(response.text);
							let responseObj = {
								name: 'loadTweet',
								response: resp
							};
							worker.postMessage(responseObj);
						},
						headers: request.headers,
						content: request.data
					}).get();
					break;
				case 'getLocalStorage':
					worker.postMessage({ name: 'getLocalStorage', message: localStorage.getItems() });
					break;
				case 'saveLocalStorage':
					for (let key in request.data) {
						localStorage.setItem(key,request.data[key]);
					}
					localStorage.setItem('importedFromForeground', true);
					worker.postMessage({ name: 'saveLocalStorage', message: localStorage.getItems() });
					break;
				case 'localStorage':
					switch (request.operation) {
						case 'getItem':
							worker.postMessage({status: true, value: localStorage.getItem(request.itemName)});
							break;
						case 'removeItem':
							localStorage.removeItem(request.itemName);
							// worker.postMessage({status: true, value: null});
							break;
						case 'setItem':
							localStorage.setItem(request.itemName, request.itemValue);
							break;
					}
					break;
				case 'XHRCache':
					switch (request.operation) {
						case 'clear':
							XHRCache.clear();
							break;
					}
					break;
				case 'pageAction':
					let onoff = request.visible ? 'on' : 'off';
					switch (request.action) {
						case 'show':
							if (!styleSheetButton) {
								styleSheetButton = ToggleButton({
									id: 'res-styletoggle',
									label: 'toggle subreddit CSS',
									disabled: false,
									checked: request.visible,
									icon: {
										'16': self.data.url('images/css-' + onoff + '-small.png'),
										'32': self.data.url('images/css-' + onoff + '.png')
									},
									onChange: function(state) {
										let worker = getActiveWorker();
										worker.postMessage({
											name: 'subredditStyle',
											toggle: state.checked
										});
									}
								});
							} else {
								styleSheetButton.state('tab', {
									label: 'toggle subreddit CSS',
									icon: {
										'16': self.data.url('images/css-' + onoff + '-small.png'),
										'32': self.data.url('images/css-' + onoff + '.png')
									},
									disabled: false,
									checked: request.visible
								});
							}
							break;
						case 'stateChange':
							if (styleSheetButton) {
								styleSheetButton.state('tab', {
									label: 'toggle subreddit CSS',
									icon: {
										'16': self.data.url('images/css-' + onoff + '-small.png'),
										'32': self.data.url('images/css-' + onoff + '.png')
									},
									disabled: false,
									checked: request.visible
								});
							}
							break;
						case 'disable':
							if (styleSheetButton) {
								styleSheetButton.state('tab', {
									label: 'toggle subreddit CSS (must be on a subreddit)',
									disabled: true,
									checked: true
								});
							}
							break;
						case 'hide':
							if (styleSheetButton) {
								styleSheetButton.destroy();
							}
							break;
					}
					break;
				case 'addURLToHistory':
					isPrivate = priv.isPrivate(windows.activeWindow);
					if (isPrivate) {
						// do not add to history if in private browsing mode!
						return false;
					}
					let uri = makeURI(request.url);
					historyService.updatePlaces({
						uri: uri,
						visits: [{
							transitionType: Ci.nsINavHistoryService.TRANSITION_LINK,
							visitDate: Date.now() * 1000
						}]
					});
					break;
				default:
					worker.postMessage({status: 'unrecognized request type'});
					break;
			}
		});
	}
});
