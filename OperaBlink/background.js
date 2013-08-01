/*

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

XHRCache = {
	forceCache: false,
	capacity: 250,
	entries: {},
	count: 0,
	check: function(key) {
		if (key in this.entries) {
//				console.count("hit");
			this.entries[key].hits++;
			return this.entries[key].data;
		} else {
//				console.count("miss");
			return null;
		}
	},
	add: function(key, value) {
		if (key in this.entries) {
			return;
		} else {
//				console.count("add");
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
//				if (this.entries[key].hits == 1) {
//					delete this.entries[key];
//					this.count--;
//					continue;
//				}

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
//			console.count("prune");
	},
	clear: function() {
		this.entries = {};
		this.count = 0;
	}
};

chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
		switch(request.requestType) {
			case 'deleteCookie':
				// Get chrome cookie handler
				if (!chrome.cookies) {
                    chrome.cookies = chrome.experimental.cookies;
                }
				chrome.cookies.remove({'url': 'http://reddit.com', 'name': request.cname});
				break;
			case 'GM_xmlhttpRequest':
				if (request.aggressiveCache || XHRCache.forceCache) {
					var cachedResult = XHRCache.check(request.url);
					if (cachedResult) {
						sendResponse(cachedResult);
						return;
					}
				}
				var xhr = new XMLHttpRequest();
				xhr.open(request.method, request.url, true);
				if (request.method == "POST") {
					xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				}
				xhr.onreadystatechange = function(a) {
					if (xhr.readyState == 4) {
						//Only store `status` and `responseText` fields
						var response = {status: xhr.status, responseText: xhr.responseText};
						sendResponse(response);
						//Only cache on HTTP OK and non empty body
						if ((request.aggressiveCache || XHRCache.forceCache) && (xhr.status == 200 && xhr.responseText)) {
							XHRCache.add(request.url, response);
						}
					}
				};
				xhr.send(request.data);
				return true;
				break;
			case 'singleClick':
				var button = !((request.button == 1) || (request.ctrl == 1));
				// Get the selected tab so we can get the index of it.  This allows us to open our new tab as the "next" tab.
				var newIndex = sender.tab.index+1;
				// handle requests from singleClick module
				if (request.openOrder == 'commentsfirst') {
					// only open a second tab if the link is different...
					if (request.linkURL != request.commentsURL) {
						chrome.tabs.create({url: request.commentsURL, selected: button, index: newIndex, openerTabId: sender.tab.id});
					}
					chrome.tabs.create({url: request.linkURL, selected: button, index: newIndex+1, openerTabId: sender.tab.id});
				} else {
					chrome.tabs.create({url: request.linkURL, selected: button, index: newIndex, openerTabId: sender.tab.id});
					// only open a second tab if the link is different...
					if (request.linkURL != request.commentsURL) {
						chrome.tabs.create({url: request.commentsURL, selected: button, index: newIndex+1, openerTabId: sender.tab.id});
					}
				}
				sendResponse({status: "success"});
				break;
			case 'keyboardNav':
				var button = !(request.button == 1);
				// handle requests from keyboardNav module
				thisLinkURL = request.linkURL;
				if (thisLinkURL.toLowerCase().substring(0,4) != 'http') {
					(thisLinkURL.substring(0,1) == '/') ? thisLinkURL = 'http://www.reddit.com' + thisLinkURL : thisLinkURL = location.href + thisLinkURL;
				}
				// Get the selected tab so we can get the index of it.  This allows us to open our new tab as the "next" tab.
				var newIndex = sender.tab.index+1;
				chrome.tabs.create({url: thisLinkURL, selected: button, index: newIndex, openerTabId: sender.tab.id});
				sendResponse({status: "success"});
				break;
			case 'openLinkInNewTab':
				var focus = (request.focus === true);
				// handle requests from keyboardNav module
				thisLinkURL = request.linkURL;
				if (thisLinkURL.toLowerCase().substring(0,4) != 'http') {
					(thisLinkURL.substring(0,1) == '/') ? thisLinkURL = 'http://www.reddit.com' + thisLinkURL : thisLinkURL = location.href + thisLinkURL;
				}
				// Get the selected tab so we can get the index of it.  This allows us to open our new tab as the "next" tab.
				var newIndex = sender.tab.index+1;
				chrome.tabs.create({url: thisLinkURL, selected: focus, index: newIndex, openerTabId: sender.tab.id});
				sendResponse({status: "success"});
				break;
			case 'compareVersion':
				var xhr = new XMLHttpRequest();
				xhr.open("GET", request.url, true);
				xhr.onreadystatechange = function() {
					if (xhr.readyState == 4) {
						// JSON.parse does not evaluate the attacker's scripts.
						var resp = JSON.parse(xhr.responseText);
						sendResponse(resp);
					}
				};
				xhr.send();
				return true;
				break;
			case 'loadTweet':
				var xhr = new XMLHttpRequest();
				xhr.open("GET", request.url, true);
				xhr.onreadystatechange = function() {
					if (xhr.readyState == 4) {
						// JSON.parse does not evaluate the attacker's scripts.
						var resp = JSON.parse(xhr.responseText);
						sendResponse(resp);
					}
				};
				xhr.send();
				return true;
				break;
			case 'getLocalStorage':
				sendResponse(localStorage);
				break;
			case 'saveLocalStorage':
				for (var key in request.data) {
					localStorage.setItem(key,request.data[key]);
				}
				localStorage.setItem('importedFromForeground',true);
				sendResponse(localStorage);
				break;
			case 'localStorage':
				switch (request.operation) {
					case 'getItem':
						sendResponse({status: true, value: localStorage.getItem(request.itemName)});
						break;
					case 'removeItem':
						localStorage.removeItem(request.itemName);
						sendResponse({status: true, value: null});
						break;
					case 'setItem':
						localStorage.setItem(request.itemName, request.itemValue);
						sendResponse({status: true, value: null});
						var thisTabID = sender.tab.id;
						chrome.tabs.query({}, function(tabs){
							for (var i = 0; i < tabs.length; i++) {
								if (thisTabID != tabs[i].id) {
									chrome.tabs.sendMessage(tabs[i].id, { requestType: "localStorage", itemName: request.itemName, itemValue: request.itemValue });
								}
							}
						});
						break;
				}
				break;
			case 'addURLToHistory':
				chrome.history.addUrl({url: request.url});
				break;
			case 'XHRCache':
				switch (request.operation) {
					case 'clear':
						XHRCache.clear();
						break;
				}
				break;
			default:
				sendResponse({status: "unrecognized request type"});
				break;
		}
	}
);
