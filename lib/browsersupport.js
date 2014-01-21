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


function operaUpdateCallback(obj) {
	RESUtils.compareVersion(obj);
}

function operaForcedUpdateCallback(obj) {
	RESUtils.compareVersion(obj, true);
}

// This object will store xmlHTTPRequest callbacks for Safari because Safari's extension architecture seems stupid.
// This really shouldn't be necessary, but I can't seem to hold on to an onload function that I pass to the background page...
xhrQueue = {
	count: 0,
	onloads: []
};


// if this is a jetpack addon, add an event listener like Safari's message handler...
if (BrowserDetect.isFirefox()) {
	self.on('message', function(msgEvent) {
		switch (msgEvent.name) {
			case 'readResource':
				// console.log(msgEvent.data);
				window.RESLoadCallbacks[msgEvent.transaction](msgEvent.data);
				delete window.RESLoadCallbacks[msgEvent.transaction];
				break;
			case 'GM_xmlhttpRequest':
				// Fire the appropriate onload function for this xmlhttprequest.
				xhrQueue.onloads[msgEvent.XHRID](msgEvent.response);
				break;
			case 'compareVersion':
				var forceUpdate = false;
				if (typeof msgEvent.message.forceUpdate !== 'undefined') forceUpdate = true;
				RESUtils.compareVersion(msgEvent.message, forceUpdate);
				break;
			case 'loadTweet':
				var tweet = msgEvent.response;
				var thisExpando = modules['styleTweaks'].tweetExpando;
				$(thisExpando).html(tweet.html);
				thisExpando.style.display = 'block';
				thisExpando.classList.add('twitterLoaded');
				break;
				// for now, commenting out the old way of handling tweets as AMO will not approve.
				/*				
				var tweet = msgEvent.response;
				var thisExpando = modules['styleTweaks'].tweetExpando;
				thisExpando.innerHTML = '';
				// the iframe is to sandbox this remote javascript from accessing reddit's javascript, etc.
				// this is done this way as requested by the AMO review team.
				var sandboxFrame = document.createElement('iframe');
				var seamless = document.createAttribute('seamless');
				sandboxFrame.setAttribute('sandbox','allow-scripts allow-same-origin');
				sandboxFrame.setAttributeNode(seamless);
				sandboxFrame.setAttribute('style','border: none;');
				sandboxFrame.setAttribute('width','480');
				sandboxFrame.setAttribute('height','260');
				sandboxFrame.setAttribute('src','data:text/html,<html><head><base href="https://platform.twitter.com"></head><body>'+encodeURIComponent(tweet.html)+"</body></html>");
				$(thisExpando).append(sandboxFrame);
				// $(thisExpando).html(tweet.html);
				thisExpando.style.display = 'block';
				thisExpando.classList.add('twitterLoaded');
				*/
			case 'getLocalStorage':
				// Does RESStorage have actual data in it?  If it doesn't, they're a legacy user, we need to copy 
				// old school localStorage from the foreground page to the background page to keep their settings...
				if (typeof msgEvent.message.importedFromForeground === 'undefined') {
					// it doesn't exist.. copy it over...
					var thisJSON = {
						requestType: 'saveLocalStorage',
						data: localStorage
					};
					self.postMessage(thisJSON);
				} else {
					setUpRESStorage(msgEvent.message);
					//RESInit();
				}
				break;
			case 'saveLocalStorage':
				// Okay, we just copied localStorage from foreground to background, let's set it up...
				setUpRESStorage(msgEvent.message);
				break;
			case 'localStorage':
				RESStorage.setItem(msgEvent.itemName, msgEvent.itemValue, true);
				break;
			default:
				// console.log('unknown event type in self.on');
				// console.log(msgEvent.toSource());
				break;
		}
	});
}

// This is the message handler for Safari - the background page calls this function with return data...

function safariMessageHandler(msgEvent) {
	switch (msgEvent.name) {
		case 'GM_xmlhttpRequest':
			// Fire the appropriate onload function for this xmlhttprequest.
			xhrQueue.onloads[msgEvent.message.XHRID](msgEvent.message);
			break;
		case 'compareVersion':
			var forceUpdate = false;
			if (typeof msgEvent.message.forceUpdate !== 'undefined') forceUpdate = true;
			RESUtils.compareVersion(msgEvent.message, forceUpdate);
			break;
		case 'loadTweet':
			var tweet = msgEvent.message;
			var thisExpando = modules['styleTweaks'].tweetExpando;
			$(thisExpando).html(tweet.html);
			thisExpando.style.display = 'block';
			thisExpando.classList.add('twitterLoaded');
			break;
		case 'getLocalStorage':
			// Does RESStorage have actual data in it?  If it doesn't, they're a legacy user, we need to copy 
			// old schol localStorage from the foreground page to the background page to keep their settings...
			if (typeof msgEvent.message.importedFromForeground === 'undefined') {
				// it doesn't exist.. copy it over...
				var ls = {};
				for (var i = 0, len = localStorage.length; i < len; i++) {
					if (localStorage.key(i)) {
						ls[localStorage.key(i)] = localStorage.getItem(localStorage.key(i));
					}
				}
				var thisJSON = {
					requestType: 'saveLocalStorage',
					data: ls
				};
				safari.self.tab.dispatchMessage('saveLocalStorage', thisJSON);
			} else {
				setUpRESStorage(msgEvent.message);
				//RESInit();
			}
			break;
		case 'saveLocalStorage':
			// Okay, we just copied localStorage from foreground to background, let's set it up...
			setUpRESStorage(msgEvent.message);
			//RESInit();
			break;
		case 'addURLToHistory':
			var url = msgEvent.message.url;
			modules['showImages'].imageTrackFrame.contentWindow.location.replace(url);
			break;
		case 'localStorage':
			RESStorage.setItem(msgEvent.message.itemName, msgEvent.message.itemValue, true);
			break;
		default:
			// console.log('unknown event type in safariMessageHandler');
			break;
	}
}

// This is the message handler for Opera - the background page calls this function with return data...

function operaMessageHandler(msgEvent) {
	var eventData = msgEvent.data;
	switch (eventData.msgType) {
		case 'GM_xmlhttpRequest':
			// Fire the appropriate onload function for this xmlhttprequest.
			xhrQueue.onloads[eventData.XHRID](eventData.data);
			break;
		case 'compareVersion':
			var forceUpdate = false;
			if (typeof eventData.data.forceUpdate !== 'undefined') forceUpdate = true;
			RESUtils.compareVersion(eventData.data, forceUpdate);
			break;
		case 'loadTweet':
			var tweet = eventData.data;
			var thisExpando = modules['styleTweaks'].tweetExpando;
			$(thisExpando).html(tweet.html);
			thisExpando.style.display = 'block';
			thisExpando.classList.add('twitterLoaded');
			break;
		case 'getLocalStorage':
			// Does RESStorage have actual data in it?  If it doesn't, they're a legacy user, we need to copy 
			// old schol localStorage from the foreground page to the background page to keep their settings...
			if (typeof eventData.data.importedFromForeground === 'undefined') {
				// it doesn't exist.. copy it over...
				var thisJSON = {
					requestType: 'saveLocalStorage',
					data: localStorage
				};
				opera.extension.postMessage(JSON.stringify(thisJSON));
			} else {
				if (location.hostname.indexOf('reddit') !== -1) {
					setUpRESStorage(eventData.data);
					//RESInit();
				}
			}
			break;
		case 'saveLocalStorage':
			// Okay, we just copied localStorage from foreground to background, let's set it up...
			setUpRESStorage(eventData.data);
			if (location.hostname.indexOf('reddit') !== -1) {
				//RESInit();
			}
			break;
		case 'localStorage':
			if ((typeof RESStorage !== 'undefined') && (typeof RESStorage.setItem === 'function')) {
				RESStorage.setItem(eventData.itemName, eventData.itemValue, true);
			} else {
				// a change in opera requires this wait/timeout for the RESStorage grab to work...
				var waitForRESStorage = function(eData) {
					if ((typeof RESStorage !== 'undefined') && (typeof RESStorage.setItem === 'function')) {
						RESStorage.setItem(eData.itemName, eData.itemValue, true);
					} else {
						setTimeout(function() {
							waitForRESStorage(eData);
						}, 200);
					}
				};
				var savedEventData = {
					itemName: eventData.itemName,
					itemValue: eventData.itemValue
				};
				waitForRESStorage(savedEventData);
			}
			break;
		case 'addURLToHistory':
			var url = eventData.url;
			if (!eventData.isPrivate) {
				modules['showImages'].imageTrackFrame.contentWindow.location.replace(url);
			}
			break;
		default:
			// console.log('unknown event type in operaMessageHandler');
			break;
	}
}

// listen for messages from chrome background page
if (BrowserDetect.isChrome()) {
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			switch (request.requestType) {
				case 'localStorage':
					RESStorage.setItem(request.itemName, request.itemValue, true);
					break;
				default:
					// sendResponse({status: "unrecognized request type"});
					break;
			}
		}
	);
}

if (BrowserDetect.isSafari()) {
	// Safari has a ridiculous bug that causes it to lose access to safari.self.tab if you click the back button.
	// this stupid one liner fixes that.
	window.onunload = function() {};
	safari.self.addEventListener("message", safariMessageHandler, false);
}
// we can't do this check for opera here because we need to wait until DOMContentLoaded is triggered, I think.  Putting this in RESinit();

// opera compatibility
if (BrowserDetect.isOpera()) {
	// removing this line for new localStorage methodology (store in extension localstorage)
	sessionStorage = window.sessionStorage;
	localStorage = window.localStorage;
	location = window.location;
	XMLHttpRequest = window.XMLHttpRequest;
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
	} else if (BrowserDetect.isSafari()) {
		GM_xmlhttpRequest = function(obj) {
			obj.requestType = 'GM_xmlhttpRequest';
			// Since Safari doesn't provide legitimate callbacks, I have to store the onload function here in the main
			// userscript in a queue (see xhrQueue), wait for data to come back from the background page, then call the onload.

			// oy vey... another problem. When Safari sends xmlhttpRequests from the background page, it loses the cookies etc that it'd have 
			// had from the foreground page... so we need to write a bit of a hack here, and call different functions based on whether or 
			// not the request is cross domain... For same-domain requests, we'll call from the foreground...
			var crossDomain = (obj.url.indexOf(location.hostname) === -1);

			if ((typeof obj.onload !== 'undefined') && (crossDomain)) {
				obj.XHRID = xhrQueue.count;
				xhrQueue.onloads[xhrQueue.count] = obj.onload;

				// are you ready for a disgusting Safari hack due to stupid behavior added in 6.1 and 7?
				obj = JSON.parse(JSON.stringify(obj));
				// I hope you put on a bib for that. Safari won't let you pass a javascript object to the background page anymore.

				safari.self.tab.dispatchMessage("GM_xmlhttpRequest", obj);
				xhrQueue.count++;
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
	} else if (BrowserDetect.isOpera()) {
		GM_xmlhttpRequest = function(obj) {
			obj.requestType = 'GM_xmlhttpRequest';
			// Turns out, Opera works this way too, but I'll forgive them since their extensions are so young and they're awesome people...

			// oy vey... cross domain same issue with Opera.
			var crossDomain = (obj.url.indexOf(location.hostname) === -1);

			if ((typeof obj.onload !== 'undefined') && (crossDomain)) {
				obj.XHRID = xhrQueue.count;
				xhrQueue.onloads[xhrQueue.count] = obj.onload;
				opera.extension.postMessage(JSON.stringify(obj));
				xhrQueue.count++;
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
	} else if (BrowserDetect.isFirefox()) {
		// we must be in a Firefox / jetpack addon...
		GM_xmlhttpRequest = function(obj) {
			var crossDomain = (obj.url.indexOf(location.hostname) === -1);

			if ((typeof obj.onload !== 'undefined') && (crossDomain)) {
				obj.requestType = 'GM_xmlhttpRequest';
				// okay, firefox's jetpack addon does this same stuff... le sigh..
				if (typeof obj.onload !== 'undefined') {
					obj.XHRID = xhrQueue.count;
					xhrQueue.onloads[xhrQueue.count] = obj.onload;
					self.postMessage(obj);
					xhrQueue.count++;
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

