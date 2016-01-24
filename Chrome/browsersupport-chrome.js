/* global chrome:false */

// we need a queue of permission callback functions because of
// multiple async requests now needed... it's yucky and sad. Thanks, Chrome. :(
var permissionQueue = {
	count: 0,
	onloads: []
};


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
					modules['notifications'].showNotification('You clicked "Deny". RES needs permission to access the Twitter API at ' +
						request.data.origins[0] + ' for twitter expandos to show twitter posts in-line. ' +
						'Be assured RES does not access any of your information on twitter.com - it only accesses the API.',
						10);
					permissionQueue.onloads[request.callbackID](false);
				} else {
					permissionQueue.onloads[request.callbackID](true);
				}
				break;
			case 'subredditStyle':
				var toggle = !modules['styleTweaks'].styleToggleCheckbox.checked;
				modules['styleTweaks'].toggleSubredditStyle(toggle, RESUtils.currentSubreddit());
				break;
			case 'multicast':
				RESUtils.rpc(request.moduleID, request.method, request.arguments);
				break;
			default:
				// sendResponse({status: 'unrecognized request type'});
				break;
		}
	}
);

RESEnvironment = RESEnvironment || {};
RESEnvironment.ajax = function(obj) {
	var crossDomain = (obj.url.indexOf(location.hostname) === -1);

	if ((typeof obj.onload !== 'undefined') && (crossDomain)) {
		obj.requestType = 'ajax';
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

RESEnvironment.loadResourceAsText = function(filename, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		if (callback) {
			callback(this.responseText);
		}
	};
	xhr.open('GET', chrome.runtime.getURL(filename));
	xhr.send();
};

RESEnvironment.storageSetup = function(thisJSON) {
	// we've got chrome, get a copy of the background page's localStorage first, so don't init until after.
	chrome.runtime.sendMessage(thisJSON, function(response) {
		// Does RESStorage have actual data in it?  If it doesn't, they're a legacy user, we need to copy
		// old school localStorage from the foreground page to the background page to keep their settings...
		if (!response || typeof response.importedFromForeground === 'undefined') {
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
			chrome.runtime.sendMessage(thisJSON, function(response) {
				RESStorage.setup.complete(response);
			});
		} else {
			RESStorage.setup.complete(response);
		}
	});
};


RESEnvironment.sendMessage = function(thisJSON) {
	chrome.runtime.sendMessage(thisJSON);
};

RESEnvironment.deleteCookie = function(cookieName) {
	var deferred = new $.Deferred();

	var requestJSON = {
		requestType: 'deleteCookie',
		host: location.protocol + '//' + location.host,
		cname: cookieName
	};
	chrome.runtime.sendMessage(requestJSON, function(response) {
		deferred.resolve(cookieName);
	});

	return deferred;
};


RESEnvironment.openInNewWindow = function(thisHREF) {
	var thisJSON = {
		requestType: 'keyboardNav',
		linkURL: thisHREF
	};
	chrome.runtime.sendMessage(thisJSON);
};

RESEnvironment.openLinkInNewTab = function(thisHREF) {
	var thisJSON = {
		requestType: 'openLinkInNewTab',
		linkURL: thisHREF
	};
	chrome.runtime.sendMessage(thisJSON);
};

RESEnvironment.addURLToHistory = (function() {
	var original = RESEnvironment.addURLToHistory;

	return function(url) {
		if (chrome.extension.inIncognitoContext) {
			return;
		}

		original(url);
	};
})();
