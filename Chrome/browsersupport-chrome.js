
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
