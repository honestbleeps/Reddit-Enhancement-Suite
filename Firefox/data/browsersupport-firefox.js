/* global self */

// if this is a jetpack addon, add an event listener like Safari's message handler...
self.on('message', function(request) {
	switch (request.requestType) {
		case 'readResource':
			window.RESLoadCallbacks[request.transaction](request.data);
			delete window.RESLoadCallbacks[request.transaction];
			break;
		case 'ajax':
			// Fire the appropriate onload function for this xmlhttprequest.
			xhrQueue.onloads[request.XHRID](request.response);
			break;
		case 'compareVersion':
			var forceUpdate = false;
			if (typeof request.message.forceUpdate !== 'undefined') forceUpdate = true;
			RESUtils.compareVersion(request.message, forceUpdate);
			break;
		case 'getLocalStorage':
			// Does RESStorage have actual data in it?  If it doesn't, they're a legacy user, we need to copy
			// old school localStorage from the foreground page to the background page to keep their settings...
			if (typeof request.message.importedFromForeground === 'undefined') {
				// it doesn't exist.. copy it over...
				var thisJSON = {
					requestType: 'saveLocalStorage',
					data: localStorage
				};
				self.postMessage(thisJSON);
			} else {
				RESStorage.setup.complete(request.message);
				//RESUtils.init.complete();
			}
			break;
		case 'saveLocalStorage':
			// Okay, we just copied localStorage from foreground to background, let's set it up...
			RESStorage.setup.complete(request.message);
			break;
		case 'localStorage':
			RESStorage.setItem(request.itemName, request.itemValue, true);
			break;
		case 'subredditStyle':
			if (!modules['styleTweaks'].styleToggleCheckbox) {
				return;
			}
			if (request.message === 'refreshState') {
				var toggle = modules['styleTweaks'].styleToggleCheckbox.checked,
					currentSubreddit = RESUtils.currentSubreddit();

				if (currentSubreddit) {
					RESEnvironment.sendMessage({
						requestType: 'pageAction',
						action: 'stateChange',
						visible: toggle
					});
				}
			} else {
				var toggle = !modules['styleTweaks'].styleToggleCheckbox.checked,
					currentSubreddit = RESUtils.currentSubreddit();
				if (currentSubreddit) {
					modules['styleTweaks'].toggleSubredditStyle(toggle, RESUtils.currentSubreddit());
				}
			}
			break;
		case 'multicast':
			RESUtils.rpc(request.moduleID, request.method, request.arguments);
			break;
		default:
			// console.log('unknown event type in self.on');
			// console.log(request.toSource());
			break;
	}
});

RESEnvironment = RESEnvironment || {};
RESEnvironment.ajax = function(obj) {
	var crossDomain = (obj.url.indexOf(location.hostname) === -1);

	if ((typeof obj.onload !== 'undefined') && (crossDomain)) {
		obj.requestType = 'ajax';
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

		if (obj.isLogin) {
			request.withCredentials = true;
		}

		request.send(obj.data);
		return request;
	}
};

(function() {
	var transactions = 0;
	window.RESLoadCallbacks = [];
	RESEnvironment.loadResourceAsText = function(filename, callback) {
		window.RESLoadCallbacks[transactions] = callback;
		self.postMessage({ requestType: 'readResource', filename: filename, transaction: transactions });
		transactions++;
	};
})();

RESEnvironment.storageSetup = function(thisJSON) {
	// we've got firefox jetpack, get localStorage from background process
	self.postMessage(thisJSON);
};

RESEnvironment.RESInitReadyCheck = (function() {
	var original = RESEnvironment.RESInitReadyCheck;

	return function(RESInit) {
		// firefox addon sdk... we've included jQuery...
		// also, for efficiency, we're going to try using unsafeWindow for "less secure" (but we're not going 2 ways here, so that's OK) but faster DOM node access...
		document = unsafeWindow.document;
		window = unsafeWindow;
		if (typeof $ !== 'function') {
			console.log('Uh oh, something has gone wrong loading jQuery...');
		}

		original(RESInit);
	}
})();

RESEnvironment.openInNewWindow = function(thisHREF) {
	var thisJSON = {
		requestType: 'keyboardNav',
		linkURL: thisHREF
	};
	self.postMessage(thisJSON);
};

RESEnvironment.openLinkInNewTab = function(thisHREF) {
	var thisJSON = {
		requestType: 'openLinkInNewTab',
		linkURL: thisHREF
	};
	self.postMessage(thisJSON);
};

RESEnvironment.sendMessage = function(thisJSON) {
	self.postMessage(thisJSON);
};

RESEnvironment.deleteCookie = function(cookieName) {
	var deferred = new $.Deferred();

	var requestJSON = {
		requestType: 'deleteCookie',
		host: location.protocol + '//' + location.host,
		cname: cookieName
	};

	self.on('message', function receiveMessage(message) {
		if (message && message.removedCookie && message.removedCookie === cookieName) {
			self.removeListener('message', receiveMessage);
			deferred.resolve(cookieName);
		}
	});
	self.postMessage(requestJSON);

	return deferred;
};
