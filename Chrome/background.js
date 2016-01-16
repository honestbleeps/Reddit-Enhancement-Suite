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

/* global chrome: false */

var XHRCache = {
	forceCache: false,
	capacity: 250,
	entries: {},
	count: 0,
	check: function(key) {
		if (key in this.entries) {
//				console.count('hit');
			this.entries[key].hits++;
			return this.entries[key].data;
		} else {
//				console.count('miss');
			return null;
		}
	},
	add: function(key, value) {
		if (key in this.entries) {
			return;
		} else {
//				console.count('add');
			this.entries[key] = {data: value, timestamp: Date.now(), hits: 1};
			this.count++;
		}
		if (this.count > this.capacity) {
			this.prune();
		}
	},
	prune: function() {
		var now = Date.now();
		var bottom = [];
		for (var key in this.entries) {
//				if (this.entries[key].hits === 1) {
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
//			console.count('prune');
	},
	clear: function() {
		this.entries = {};
		this.count = 0;
	}
};

var handlePageActionClick = function(event) {
	chrome.tabs.sendMessage(event.id, { requestType: 'subredditStyle', action: 'toggle'  }, function(response) {
		// we don't really need to do anything here.
		console.log(response);
	});
};

chrome.pageAction.onClicked.addListener(handlePageActionClick);

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		var xhr, button, newIndex, thisLinkURL;
		switch (request.requestType) {
			case 'deleteCookie':
				// Get chrome cookie handler
				if (!chrome.cookies) {
					chrome.cookies = chrome.experimental.cookies;
				}
				chrome.cookies.remove({'url': request.host, 'name': request.cname});
				sendResponse({removedCookie: request.cname});
				break;
			case 'ajax':
				if (request.aggressiveCache || XHRCache.forceCache) {
					var cachedResult = XHRCache.check(request.url);
					if (cachedResult) {
						sendResponse(cachedResult);
						return;
					}
				}
				xhr = new XMLHttpRequest();
				xhr.open(request.method, request.url, true);
				if (request.method === 'POST') {
					xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
				}
				if (request.headers) {
					for (var header in request.headers) {
						if (!request.headers.hasOwnProperty(header)) continue;
						xhr.setRequestHeader(header, request.headers[header]);
					}
				}
				xhr.onreadystatechange = function() {
					if (xhr.readyState === 4) {
						// Only store `status`, `responseText` and `responseURL` fields
						var response = {status: xhr.status, responseText: xhr.responseText, responseURL: xhr.responseURL };
						sendResponse(response);
						// Only cache on HTTP OK and non empty body
						if ((request.aggressiveCache || XHRCache.forceCache) && (xhr.status === 200 && xhr.responseText)) {
							XHRCache.add(request.url, response);
						}
					}
				};
				xhr.send(request.data);
				return true;
			case 'singleClick':
				button = (request.button !== 1) && (request.ctrl !== 1);
				// Get the selected tab so we can get the index of it.  This allows us to open our new tab as the "next" tab.
				newIndex = sender.tab.index + 1;
				// handle requests from singleClick module
				if (request.openOrder === 'commentsfirst') {
					// only open a second tab if the link is different...
					if (request.linkURL !== request.commentsURL) {
						chrome.tabs.create({url: request.commentsURL, selected: button, index: newIndex, openerTabId: sender.tab.id});
					}
					chrome.tabs.create({url: request.linkURL, selected: button, index: newIndex+1, openerTabId: sender.tab.id});
				} else {
					chrome.tabs.create({url: request.linkURL, selected: button, index: newIndex, openerTabId: sender.tab.id});
					// only open a second tab if the link is different...
					if (request.linkURL !== request.commentsURL) {
						chrome.tabs.create({url: request.commentsURL, selected: button, index: newIndex+1, openerTabId: sender.tab.id});
					}
				}
				sendResponse({status: 'success'});
				break;
			case 'keyboardNav':
				button = (request.button !== 1);
				// handle requests from keyboardNav module
				thisLinkURL = request.linkURL;
				if (thisLinkURL.toLowerCase().substring(0, 4) !== 'http') {
					thisLinkURL = (thisLinkURL.substring(0, 1) === '/') ? 'http://www.reddit.com' + thisLinkURL : location.href + thisLinkURL;
				}
				// Get the selected tab so we can get the index of it.  This allows us to open our new tab as the "next" tab.
				newIndex = sender.tab.index + 1;
				chrome.tabs.create({url: thisLinkURL, selected: button, index: newIndex, openerTabId: sender.tab.id});
				sendResponse({status: 'success'});
				break;
			case 'openLinkInNewTab':
				var focus = (request.focus === true);
				// handle requests from keyboardNav module
				thisLinkURL = request.linkURL;
				if (thisLinkURL.toLowerCase().substring(0, 4) !== 'http') {
					thisLinkURL = (thisLinkURL.substring(0, 1) === '/') ? 'http://www.reddit.com' + thisLinkURL : location.href + thisLinkURL;
				}
				// Get the selected tab so we can get the index of it.  This allows us to open our new tab as the "next" tab.
				newIndex = sender.tab.index + 1;
				chrome.tabs.create({url: thisLinkURL, selected: focus, index: newIndex, openerTabId: sender.tab.id});
				sendResponse({status: 'success'});
				break;
			case 'compareVersion':
				xhr = new XMLHttpRequest();
				xhr.open('GET', request.url, true);
				xhr.onreadystatechange = function() {
					if (xhr.readyState === 4) {
						// JSON.parse does not evaluate the attacker's scripts.
						var resp = JSON.parse(xhr.responseText);
						sendResponse(resp);
					}
				};
				xhr.send();
				return true;
			case 'getLocalStorage':
				sendResponse(localStorage);
				break;
			case 'saveLocalStorage':
				for (var key in request.data) {
					localStorage.setItem(key,request.data[key]);
				}
				localStorage.setItem('importedFromForeground', true);
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
								if (thisTabID !== tabs[i].id) {
									chrome.tabs.sendMessage(tabs[i].id, { requestType: 'localStorage', itemName: request.itemName, itemValue: request.itemValue });
								}
							}
						});
						break;
				}
				break;
			case 'addURLToHistory':
				chrome.history.addUrl({url: request.url});
				break;
			case 'permissions':
				if (request.action === 'remove') {
					chrome.permissions.remove(request.data, function(removed) {
						request.result = removed;
						chrome.tabs.sendMessage(chrome.tabs.getCurrent(), request, function(response) {
							// we don't really need to do anything here.
							console.log(response);
						});
					});
				} else {
					chrome.permissions.request(request.data, function(granted) {
						request.result = granted;
						chrome.tabs.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }, function(tab) {
							chrome.tabs.sendMessage(tab[0].id, request, function(response) {
								// we don't really need to do anything here.
								console.log(response);
							});
						});

					});
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
				switch (request.action) {
					case 'show':
						chrome.pageAction.show(sender.tab.id);
						/* falls through */
					case 'stateChange':
						if (request.visible) {
							chrome.pageAction.setIcon({
								tabId: sender.tab.id,
								path: {
									19: 'images/css-on-small.png',
									38: 'images/css-on.png'
								}
							});
						} else {
							chrome.pageAction.setIcon({
								tabId: sender.tab.id,
								path: {
									19: 'images/css-off-small.png',
									38: 'images/css-off.png'
								}
							});
						}
						break;
					case 'hide':
						chrome.pageAction.hide(sender.tab.id);
						break;
				}
				break;
			case 'multicast':
				chrome.tabs.query({
					status: 'complete',
				}, function(tabs) {
					var incognito = sender.tab.incognito;
					tabs = tabs.filter(function(tab) {
						return (sender.tab.id !== tab.id) &&
							(incognito === tab.incognito);
					});

					tabs.forEach(function(tab) {
						chrome.tabs.sendMessage(tab.id, request, function(response) { });
					});
				});
				break;
			default:
				sendResponse({status: 'unrecognized request type'});
				break;
		}
	}
);
