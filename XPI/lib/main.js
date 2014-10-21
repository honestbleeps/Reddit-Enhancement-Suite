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
let ss = require('sdk/simple-storage');
let priv = require('sdk/private-browsing');
let windows = require('sdk/windows').browserWindows;
let viewFor = require('sdk/view/core').viewFor;

let localStorage = ss.storage;


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

localStorage.getItem = function(key) {
	return ss.storage[key];
};
localStorage.setItem = function(key, value) {
	ss.storage[key] = value;
};
localStorage.removeItem = function(key) {
	delete ss.storage[key];
};

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
		worker.postMessage({ name: 'getLocalStorage', message: localStorage });
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
					// Get the selected tab so we can get the index of it.  This allows us to open our new tab as the "next" tab.
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
					// Get the selected tab so we can get the index of it.  This allows us to open our new tab as the "next" tab.
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
					worker.postMessage({ name: 'getLocalStorage', message: localStorage });
					break;
				case 'saveLocalStorage':
					for (let key in request.data) {
						localStorage.setItem(key,request.data[key]);
					}
					localStorage.setItem('importedFromForeground', true);
					worker.postMessage({ name: 'saveLocalStorage', message: localStorage });
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
