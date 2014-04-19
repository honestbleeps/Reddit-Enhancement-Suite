var BrowserDetect = {
	init: function() {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent) ||
			this.searchVersion(navigator.appVersion) ||
			"an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";

		// set up MutationObserver variable to take whichever is supported / existing...
		// unfortunately, this doesn't (currently) exist in Opera.
		// this.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || null;
		// At the time of writing WebKit's mutation observer leaks entire pages on refresh so it needs to be disabled.
		this.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || null;

		// null out MutationObserver to test legacy DOMNodeInserted
		// this.MutationObserver = null;
	},
	searchString: function(data) {
		for (var i = 0; i < data.length; i++) {
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) !== -1) {
					return data[i].identity;
				}
			} else if (dataProp) {
				return data[i].identity;
			}
		}
	},
	searchVersion: function(dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index === -1) {
			return;
		}
		return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
	},
	isChrome: function() {
		return typeof chrome !== 'undefined';
	},
	isFirefox: function() {
		return typeof self.on === 'function';
	},
	isOperaBlink: function() {
		return typeof chrome !== 'undefined' && BrowserDetect.browser === "Opera";
	},
	isOpera: function() {
		return typeof opera !== 'undefined';
	},
	isSafari: function() {
		return typeof safari !== 'undefined';
	},
	dataBrowser: [{
		string: navigator.userAgent,
		subString: "OPR/",
		identity: "Opera"
	}, {
		string: navigator.userAgent,
		subString: "Chrome",
		identity: "Chrome"
	}, {
		string: navigator.userAgent,
		subString: "OmniWeb",
		versionSearch: "OmniWeb/",
		identity: "OmniWeb"
	}, {
		string: navigator.vendor,
		subString: "Apple",
		identity: "Safari",
		versionSearch: "Version"
	}, {
		prop: window.opera,
		identity: "Opera",
		versionSearch: "Version"
	}, {
		string: navigator.vendor,
		subString: "iCab",
		identity: "iCab"
	}, {
		string: navigator.vendor,
		subString: "KDE",
		identity: "Konqueror"
	}, {
		string: navigator.userAgent,
		subString: "Firefox",
		identity: "Firefox"
	}, {
		string: navigator.vendor,
		subString: "Camino",
		identity: "Camino"
	}, { // for newer Netscapes (6+)
		string: navigator.userAgent,
		subString: "Netscape",
		identity: "Netscape"
	}, {
		string: navigator.userAgent,
		subString: "MSIE",
		identity: "Explorer",
		versionSearch: "MSIE"
	}, {
		string: navigator.userAgent,
		subString: "Gecko",
		identity: "Mozilla",
		versionSearch: "rv"
	}, {
		// for older Netscapes (4-)
		string: navigator.userAgent,
		subString: "Mozilla",
		identity: "Netscape",
		versionSearch: "Mozilla"
	}],
	dataOS: [{
		string: navigator.platform,
		subString: "Win",
		identity: "Windows"
	}, {
		string: navigator.platform,
		subString: "Mac",
		identity: "Mac"
	}, {
		string: navigator.userAgent,
		subString: "iPhone",
		identity: "iPhone/iPod"
	}, {
		string: navigator.platform,
		subString: "Linux",
		identity: "Linux"
	}]

};
BrowserDetect.init();


// This object will store xmlHTTPRequest callbacks for Safari because Safari's extension architecture seems stupid.
// This really shouldn't be necessary, but I can't seem to hold on to an onload function that I pass to the background page...
xhrQueue = {
	count: 0,
	onloads: []
};


// listen for messages from chrome background page
if (BrowserDetect.isChrome()) {
	// we need a queue of permission callback functions because of
	// multiple async requests now needed... it's yucky and sad. Thanks, Chrome. :(
	permissionQueue = {
		count: 0,
		onloads: []
	}


	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			switch (request.requestType) {
				case 'localStorage':
					if (typeof RESStorage.setItem !== 'function') {
						// if RESStorage isn't ready yet, wait a moment, then try setting again.
						var waitForRESStorage = function(request) {
							if ((typeof RESStorage !== 'undefined') && (typeof RESStorage.setItem === 'function')) {
								RESStorage.setItem(request.itemName, request.itemValue, true);
							} else {
								setTimeout(function() {
									waitForRESStorage(request);
								}, 50);
							}
						};
						waitForRESStorage(request);
					} else {
						RESStorage.setItem(request.itemName, request.itemValue, true);
					}
					break;
				case 'permissions':
					// TODO: maybe add a type here? right now only reason is for twitter expandos so text is hard coded, etc.
					// result will just be true/false here. if false, permission was rejected.
					if (!request.result) {
						modules['notifications'].showNotification("You clicked 'Deny'. RES needs permission to access the Twitter API at "+request.data.origins[0]+" for twitter expandos to show twitter posts in-line. Be assured RES does not access any of your information on twitter.com - it only accesses the API.", 10);
						permissionQueue.onloads[request.callbackID](false);
					} else {
						permissionQueue.onloads[request.callbackID](true);
					}
					break;
				default:
					// sendResponse({status: "unrecognized request type"});
					break;
			}
		}
	);
}

// GM_xmlhttpRequest for non-GM browsers
if (typeof GM_xmlhttpRequest === 'undefined') {
	if (BrowserDetect.browser === 'Explorer') {
		GM_xmlhttpRequest = function(obj) {
			var request,
				crossDomain = (obj.url.indexOf(location.hostname) === -1);
			if ((typeof obj.onload !== 'undefined') && (crossDomain)) {
				obj.requestType = 'GM_xmlhttpRequest';
				request = new XDomainRequest();
				request.onload = function() {
					obj.onload(request);
				};
				request.onerror = function() {
					if (obj.onerror) {
						obj.onerror(request);
					}
				};
				request.open(obj.method, obj.url);
				request.send(obj.data);
				return request;
			} else {
				request = new XMLHttpRequest();
				request.onreadystatechange = function() {
					if (obj.onreadystatechange) {
						obj.onreadystatechange(request);
					}
					if (request.readyState === 4 && obj.onload) {
						obj.onload(request);
					}
				};
				request.onerror = function() {
					if (obj.onerror) {
						obj.onerror(request);
					}
				};
				try {
					request.open(obj.method, obj.url, true);
				} catch (e) {
					if (obj.onerror) {
						obj.onerror({
							readyState: 4,
							responseHeaders: '',
							responseText: '',
							responseXML: '',
							status: 403,
							statusText: 'Forbidden'
						});
					}
					return;
				}
				if (obj.headers) {
					for (var name in obj.headers) {
						request.setRequestHeader(name, obj.headers[name]);
					}
				}
				request.send(obj.data);
				return request;
			}
		};
	}
	if (BrowserDetect.isChrome()) {
		GM_xmlhttpRequest = function(obj) {
			var crossDomain = (obj.url.indexOf(location.hostname) === -1);

			if ((typeof obj.onload !== 'undefined') && (crossDomain)) {
				obj.requestType = 'GM_xmlhttpRequest';
				if (typeof obj.onload !== 'undefined') {
					chrome.runtime.sendMessage(obj, function(response) {
						obj.onload(response);
					});
				}
			} else {
				var request = new XMLHttpRequest();
				request.onreadystatechange = function() {
					if (obj.onreadystatechange) {
						obj.onreadystatechange(request);
					}
					if (request.readyState === 4 && obj.onload) {
						obj.onload(request);
					}
				};
				request.onerror = function() {
					if (obj.onerror) {
						obj.onerror(request);
					}
				};
				try {
					request.open(obj.method, obj.url, true);
				} catch (e) {
					if (obj.onerror) {
						obj.onerror({
							readyState: 4,
							responseHeaders: '',
							responseText: '',
							responseXML: '',
							status: 403,
							statusText: 'Forbidden'
						});
					}
					return;
				}
				if (obj.headers) {
					for (var name in obj.headers) {
						request.setRequestHeader(name, obj.headers[name]);
					}
				}
				request.send(obj.data);
				return request;
			}
		};
	}
}


// this function copies localStorage (from the GM import script) to FF addon simplestorage...

function GMSVtoFFSS() {
	var console = unsafeWindow.console;
	for (var key in localStorage) {
		RESStorage.setItem(key, localStorage[key]);
	}
	localStorage.setItem('copyComplete', 'true');
	localStorage.removeItem('RES.lsTest');
	modules['notifications'].showNotification('Data transfer complete. You may now uninstall the Greasemonkey script');
}

