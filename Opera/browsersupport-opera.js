// This is the message handler for Opera - the background page calls this function with return data...

function operaMessageHandler(msgEvent) {
	var eventData = msgEvent.data;
	switch (eventData.msgType) {
		case 'ajax':
			// Fire the appropriate onload function for this xmlhttprequest.
			xhrQueue.onloads[eventData.XHRID](eventData.data);
			break;
		case 'compareVersion':
			var forceUpdate = false;
			if (typeof eventData.data.forceUpdate !== 'undefined') forceUpdate = true;
			RESUtils.compareVersion(eventData.data, forceUpdate);
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
					RESStorage.setup.complete(eventData.data);
					//RESUtils.init.complete();
				}
			}
			break;
		case 'saveLocalStorage':
			// Okay, we just copied localStorage from foreground to background, let's set it up...
			RESStorage.setup.complete(eventData.data);
			if (location.hostname.indexOf('reddit') !== -1) {
				//RESUtils.init.complete();
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
				RESEnvironment._addURLToHistoryViaForeground(url);
			}
			break;
		case 'multicast':
			RESUtils.rpc(eventData.moduleID, eventData.method, eventData.arguments);
			break;
		default:
			// console.log('unknown event type in operaMessageHandler');
			break;
	}
}

RESUtils.runtime.ajax = function(obj) {
RESEnvironment.ajax = function(obj) {
	obj.requestType = 'ajax';
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

		if (obj.isLogin) {
			request.withCredentials = true;
		}

		request.send(obj.data);
		return request;
	}
};


function operaUpdateCallback(obj) {
	RESUtils.compareVersion(obj);
}

function operaForcedUpdateCallback(obj) {
	RESUtils.compareVersion(obj, true);
}

RESEnvironment.loadResourceAsText = function(filename, callback) {
	var f = opera.extension.getFile('/' + filename);
	var fr = new FileReader();
	fr.onload = function() {
		callback(fr.result);
	};
	fr.readAsText(f);
};

RESEnvironment.storageSetup = function(thisJSON) {
	opera.extension.addEventListener('message', operaMessageHandler, false);
	// We're already loaded, call the handler immediately
	opera.extension.postMessage(JSON.stringify(thisJSON));
};

RESEnvironment.RESInitReadyCheck = function() {
	RESUtils.init.complete();
};


RESEnvironment.sendMessage = function(thisJSON) {
	opera.extension.postMessage(JSON.stringify(thisJSON));
};

RESEnvironment.getOutlineProperty = function() {
	return 'border';
};

RESEnvironment.openNewWindow = function (thisHREF) {
	var thisJSON = {
		requestType: 'keyboardNav',
		linkURL: thisHREF
	};
	opera.extension.postMessage(JSON.stringify(thisJSON));
};

RESEnvironment.openLinkInNewTab = function (thisHREF) {
	var thisJSON = {
		requestType: 'openLinkInNewTab',
		linkURL: thisHREF
	};
	opera.extension.postMessage(JSON.stringify(thisJSON));
};

RESEnvironment.addURLToHistory = RESEnvironment._addURLToHistory;
