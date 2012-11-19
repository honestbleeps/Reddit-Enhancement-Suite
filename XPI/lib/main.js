// Import the APIs we need.
var pageMod = require("page-mod");
var Request = require('request').Request;
var self = require("self"); 
var firefox = typeof(require);
var tabs = require("tabs");
var ss = require("simple-storage");

// require chrome allows us to use XPCOM objects...
// var {Cc, Cu, Cr} = require("chrome");
const {Cc,Ci} = require("chrome");
// from XPCOM, use the NSIGlobalHistory2 service...
// var historyService = Cc["@mozilla.org/browser/nav-history-service;1"].getService(Ci.nsIGlobalHistory2);
var historyService = Cc["@mozilla.org/browser/global-history;2"].getService(Ci.nsIGlobalHistory2)

// this function takes in a string (and optional charset, paseURI) and creates an nsURI object, which is required by historyService.addURI...
function makeURI(aURL, aOriginCharset, aBaseURI) {  
  var ioService = Cc["@mozilla.org/network/io-service;1"]  
                  .getService(Ci.nsIIOService);  
  return ioService.newURI(aURL, aOriginCharset, aBaseURI);  
} 

var workers = [];
function detachWorker(worker, workerArray) {
  var index = workerArray.indexOf(worker);
  if(index != -1) {
    workerArray.splice(index, 1);
  }
}

var localStorage = ss.storage;

localStorage.getItem = function(key) {
	return ss.storage[key];
}
localStorage.setItem = function(key, value) {
	ss.storage[key] = value;
}
localStorage.removeItem = function(key) {
	delete ss.storage[key];
}

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
	for (i in workers) {
		if ((typeof(workers[i].tab) != 'undefined') && (tab.title == workers[i].tab.title)) {
			workers[i].postMessage({ name: "getLocalStorage", message: localStorage });
		}
	}
});


pageMod.PageMod({
  include: ["*.reddit.com"],
  contentScriptWhen: 'start',
  contentScriptFile: [
  	self.data.url('jquery-1.6.4.min.js'), 
	self.data.url('guiders-1.2.8.js'),
	self.data.url('jquery.dragsort-0.4.3.min.js'),
	self.data.url('jquery-fieldselection.min.js'),
	self.data.url('tinycon.min.js'),
	self.data.url('jquery.tokeninput.js'),
	self.data.url('snuownd.js'),
  	self.data.url('reddit_enhancement_suite.user.js')
  ],
  onAttach: function(worker) {
	// when a tab is activated, repopulate localStorage so that changes propagate across tabs...

	workers.push(worker);
    worker.on('detach', function () {
      detachWorker(this, workers);
    });
	worker.on('message', function(data) {
		var request = data;
		switch(request.requestType) {
			case 'GM_xmlhttpRequest':
				var responseObj = {
					XHRID: request.XHRID,
					name: request.requestType
				}
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
							}
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
							}
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
				// handle requests from singleClick module
				if (request.openOrder == 'commentsfirst') {
					// only open a second tab if the link is different...
					if (request.linkURL != request.commentsURL) {
						tabs.open({url: request.commentsURL, inBackground: button });
					}
					tabs.open({url: request.linkURL, inBackground: button });
				} else {
					tabs.open({url: request.linkURL, inBackground: button });
					// only open a second tab if the link is different...
					if (request.linkURL != request.commentsURL) {
						tabs.open({url: request.commentsURL, inBackground: button });
					}
				}
				worker.postMessage({status: "success"});
				break;
			case 'keyboardNav':
				var button = (request.button == 1);
				// handle requests from keyboardNav module
				thisLinkURL = request.linkURL;
				if (thisLinkURL.toLowerCase().substring(0,4) != 'http') {
					(thisLinkURL.substring(0,1) == '/') ? thisLinkURL = 'http://www.reddit.com' + thisLinkURL : thisLinkURL = location.href + thisLinkURL;
					
				}
				// Get the selected tab so we can get the index of it.  This allows us to open our new tab as the "next" tab.
				tabs.open({url: thisLinkURL, inBackground: button });
				worker.postMessage({status: "success"});
				break;
			case 'openLinkInNewTab':
				var focus = (request.focus == true);
				thisLinkURL = request.linkURL;
				if (thisLinkURL.toLowerCase().substring(0,4) != 'http') {
					(thisLinkURL.substring(0,1) == '/') ? thisLinkURL = 'http://www.reddit.com' + thisLinkURL : thisLinkURL = location.href + thisLinkURL;
					
				}
				// Get the selected tab so we can get the index of it.  This allows us to open our new tab as the "next" tab.
				tabs.open({url: thisLinkURL, inBackground: !focus });
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
						}
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
				var uri = makeURI(request.url);
				historyService.addURI(uri, false, true, null);
				break;
			default:
				worker.postMessage({status: "unrecognized request type"});
				break;
		}


	});
  }
});
