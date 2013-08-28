// Import the APIs we need.
var pageMod = require("page-mod");
var Request = require('request').Request;
var self = require("self");
var firefox = typeof(require);
var tabs = require("tabs");
var ss = require("simple-storage");
var priv = require("private-browsing");
var windows = require("sdk/windows").browserWindows;

// require chrome allows us to use XPCOM objects...
const {Cc,Ci,Cu} = require("chrome");
var historyService = Cc["@mozilla.org/browser/history;1"].getService(Ci.mozIAsyncHistory);
// Cookie manager for new API login
var cookieManager = Cc["@mozilla.org/cookiemanager;1"].getService().QueryInterface(Ci.nsICookieManager2);

// this function takes in a string (and optional charset, paseURI) and creates an nsURI object, which is required by historyService.addURI...
function makeURI(aURL, aOriginCharset, aBaseURI) {
  var ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
  return ioService.newURI(aURL, aOriginCharset, aBaseURI);
}

var workers = [];
function detachWorker(worker, workerArray) {
  var index = workerArray.indexOf(worker);
  if(index != -1) {
    workerArray.splice(index, 1);
  }
}

// This weird method of loading stylesheets is necessary due to the following bugs:
//
// Bug https://bugzilla.mozilla.org/show_bug.cgi?id=830121 nor, --, ---, zer0, RESO FIXED, page_mod contentStyleFile: background property incorrect priority
// Bug https://bugzilla.mozilla.org/show_bug.cgi?id=837494 nor, P1, ---, zer0, RESO FIXED, re-implement `contentStyle*` using the new nsIDOMWindowUtils methods
//
// These bugs mean that we can't override things like a declared background color with our user-loaded stylesheets without !important, and that is bad.
//
// As of 2013-04-27 - these bugs are still present in stable Firefox, but fixed in Nightly.  However, the fix that lives in nightly isn't slated for stable
// release until August 2013, so we need this temp fix for now.
//
// TODO: go back to contentStyleFile listing in pageMod instead of this crazy way of loading stylesheets once above bugs are fixed.
var sss = Cc["@mozilla.org/content/style-sheet-service;1"]
                    .getService(Ci.nsIStyleSheetService);
var ios = Cc["@mozilla.org/network/io-service;1"]
                    .getService(Ci.nsIIOService);

var uri;
var stylesheets = ['nightmode.css','res.css','commentBoxes.css'];
for (var i in stylesheets) {
	uri = ios.newURI(self.data.url(stylesheets[i]), null, null);
	if(!sss.sheetRegistered(uri, sss.USER_SHEET)) {
		sss.loadAndRegisterSheet(uri, sss.AUTHOR_SHEET);
	}
}

exports.onUnload = function (reason) {
	if (reason === 'uninstall') {
		for (var i in stylesheets) {
			uri = ios.newURI(self.data.url(stylesheets[i]), null, null);
			if(sss.sheetRegistered(uri, sss.USER_SHEET)) {
				sss.unregisterSheet(uri, sss.AUTHOR_SHEET);
			}
		}
	}
};

var localStorage = ss.storage;

localStorage.getItem = function(key) {
	return ss.storage[key];
};
localStorage.setItem = function(key, value) {
	ss.storage[key] = value;
};
localStorage.removeItem = function(key) {
	delete ss.storage[key];
};

XHRCache = {
	forceCache: false,
	capacity: 250,
	entries: {},
	count: 0,
	check: function(key) {
		if (key in this.entries) {
//			console.log("hit");
			this.entries[key].hits++;
			return this.entries[key].data;
		} else {
//			console.log("miss");
			return null;
		}
	},
	add: function(key, value) {
		if (key in this.entries) {
			return;
		} else {
//			console.log("add");
			this.entries[key] = {data: value, timestamp: new Date(), hits: 1};
			this.count++;
		}
		if (this.count > this.capacity) {
			this.prune();
		}
	},
	prune: function() {
		var now = new Date();
		var bottom = [];
		for (var key in this.entries) {
//			if (this.entries[key].hits == 1) {
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
		var count = this.count - Math.floor(this.capacity / 2);
		for (var i = 0; i < count; i++) {
			delete this.entries[bottom[i].key];
			this.count--;
		}
//		console.log("prune");
	},
	clear: function() {
		this.entries = {};
		this.count = 0;
	}
};
tabs.on('activate', function(tab) {
	// find this worker...
	for (var i in workers) {
		if ((typeof(workers[i].tab) != 'undefined') && (tab.title == workers[i].tab.title)) {
			workers[i].postMessage({ name: "getLocalStorage", message: localStorage });
		}
	}
});


pageMod.PageMod({
  include: ["*.reddit.com"],
  contentScriptWhen: 'start',
  contentScriptFile: [
	self.data.url('jquery-1.9.1.min.js'),
	self.data.url('guiders-1.2.8.js'),
	self.data.url('jquery.dragsort-0.6.js'),
	self.data.url('jquery-fieldselection.min.js'),
	self.data.url('tinycon.js'),
	self.data.url('jquery.tokeninput.js'),
	self.data.url('snuownd.js'),
	self.data.url('reddit_enhancement_suite.user.js')
  ],
/*  contentStyleFile: [
	self.data.url('nightmode.css'),
	self.data.url('commentBoxes.css'),
	self.data.url('res.css')
  ],
*/  onAttach: function(worker) {
	// when a tab is activated, repopulate localStorage so that changes propagate across tabs...

	workers.push(worker);
    worker.on('detach', function () {
      detachWorker(this, workers);
    });
	worker.on('message', function(data) {
		var request = data;
		switch(request.requestType) {
			case 'deleteCookie':
				cookieManager.remove('.reddit.com', request.cname, '/', false);
				break;
			case 'GM_xmlhttpRequest':
				var responseObj = {
					XHRID: request.XHRID,
					name: request.requestType
				};
				if (request.aggressiveCache || XHRCache.forceCache) {
					var cachedResult = XHRCache.check(request.url);
					if (cachedResult) {
						responseObj.response = cachedResult;
						worker.postMessage(responseObj);
						return;
					}
				}
				if (request.method == 'POST') {
					Request({
						url: request.url,
						onComplete: function(response) {
							responseObj.response = {
								responseText: response.text,
								status: response.status
							};
							//Only cache on HTTP OK and non empty body
							if ((request.aggressiveCache || XHRCache.forceCache) && (response.status == 200 && response.text)) {
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
							if ((request.aggressiveCache || XHRCache.forceCache) && (response.status == 200 && response.text)) {
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
				var button = ((request.button == 1) || (request.ctrl == 1));
				var isPrivate = priv.isPrivate(windows.activeWindow);

				// handle requests from singleClick module
				if (request.openOrder == 'commentsfirst') {
					// only open a second tab if the link is different...
					if (request.linkURL != request.commentsURL) {
						tabs.open({url: request.commentsURL, inBackground: button, isPrivate: isPrivate });
					}
					tabs.open({url: request.linkURL, inBackground: button, isPrivate: isPrivate });
				} else {
					tabs.open({url: request.linkURL, inBackground: button, isPrivate: isPrivate });
					// only open a second tab if the link is different...
					if (request.linkURL != request.commentsURL) {
						tabs.open({url: request.commentsURL, inBackground: button, isPrivate: isPrivate });
					}
				}
				worker.postMessage({status: "success"});
				break;
			case 'keyboardNav':
				var button = (request.button == 1);
				var isPrivate = priv.isPrivate(windows.activeWindow);

				// handle requests from keyboardNav module
				thisLinkURL = request.linkURL;
				if (thisLinkURL.toLowerCase().substring(0,4) != 'http') {
					(thisLinkURL.substring(0,1) == '/') ? thisLinkURL = 'http://www.reddit.com' + thisLinkURL : thisLinkURL = location.href + thisLinkURL;
				}
				// Get the selected tab so we can get the index of it.  This allows us to open our new tab as the "next" tab.
				tabs.open({url: thisLinkURL, inBackground: button, isPrivate: isPrivate });
				worker.postMessage({status: "success"});
				break;
			case 'openLinkInNewTab':
				var focus = (request.focus === true);
				var isPrivate = priv.isPrivate(windows.activeWindow);
				thisLinkURL = request.linkURL;
				if (thisLinkURL.toLowerCase().substring(0,4) != 'http') {
					(thisLinkURL.substring(0,1) == '/') ? thisLinkURL = 'http://www.reddit.com' + thisLinkURL : thisLinkURL = location.href + thisLinkURL;
				}
				// Get the selected tab so we can get the index of it.  This allows us to open our new tab as the "next" tab.
				tabs.open({url: thisLinkURL, inBackground: !focus, isPrivate: isPrivate });
				worker.postMessage({status: "success"});
				break;
			case 'loadTweet':
				Request({
					url: request.url,
					onComplete: function(response) {
						var resp = JSON.parse(response.text);
						var responseObj = {
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
				for (var key in request.data) {
					localStorage.setItem(key,request.data[key]);
				}
				localStorage.setItem('importedFromForeground',true);
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
			case 'addURLToHistory':
				var isPrivate = priv.isPrivate(windows.activeWindow);
				if (isPrivate) {
					// do not add to history if in private browsing mode!
					return false;
				}
				var uri = makeURI(request.url);
				historyService.updatePlaces({
					uri: uri,
					visits: [{
						transitionType: Ci.nsINavHistoryService.TRANSITION_LINK,
						visitDate: Date.now() * 1000
					}]
				});
				break;
			default:
				worker.postMessage({status: "unrecognized request type"});
				break;
		}


	});
  }
});