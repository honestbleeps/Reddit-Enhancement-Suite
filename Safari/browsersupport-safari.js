/* global safari */
// This is the message handler for Safari - the background page calls this function with return data...

function safariMessageHandler(msgEvent) {
	var request = msgEvent.message;
	switch (msgEvent.name) {
		case 'ajax':
			// Fire the appropriate onload function for this xmlhttprequest.
			xhrQueue.onloads[request.XHRID](request);
			break;
		case 'compareVersion':
			var forceUpdate = false;
			if (typeof request.forceUpdate !== 'undefined') forceUpdate = true;
			RESUtils.compareVersion(request, forceUpdate);
			break;
		case 'getLocalStorage':
			// Does RESStorage have actual data in it?  If it doesn't, they're a legacy user, we need to copy
			// old schol localStorage from the foreground page to the background page to keep their settings...
			if (typeof request.importedFromForeground === 'undefined') {
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
				RESStorage.setup.complete(request);
				//RESUtils.init.complete();
			}
			break;
		case 'saveLocalStorage':
			// Okay, we just copied localStorage from foreground to background, let's set it up...
			RESStorage.setup.complete(request);
			//RESUtils.init.complete();
			break;
		case 'addURLToHistory':
			var url = request.url;
			RESEnvironment._addURLToHistoryViaForeground(url);
			break;
		case 'localStorage':
			RESStorage.setItem(request.itemName, request.itemValue, true);
			break;
		case 'multicast':
			RESUtils.rpc(request.moduleID, request.method, request.arguments);
			break;
		default:
			// console.log('unknown event type in safariMessageHandler');
			break;
	}
}


// Safari has a ridiculous bug that causes it to lose access to safari.self.tab if you click the back button.
// this stupid one liner fixes that.
window.onunload = function() {};
safari.self.addEventListener('message', safariMessageHandler, false);


RESEnvironment.ajax = function(obj) {
	obj.requestType = 'ajax';
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

		safari.self.tab.dispatchMessage('ajax', obj);
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


RESEnvironment.sanitizeJSON = function(data) {
	if (data.substring(0, 2) === 's{') {
		data = data.substring(1, data.length);
	}

	return data;
};

RESEnvironment.loadResourceAsText = function(filename) {
	return new Promise((resolve, reject) => {
		var url = safari.extension.baseURI + filename;

		RESEnvironment.ajax({
			method: 'GET',
			url: url,
			onload: response => resolve(response.responseText),
			onerror: reject
		});
	});
};

RESEnvironment.storageSetup = function(thisJSON) {
	var setupInterval;
	// we've got safari, get localStorage from background process
	var setupCallback = function() {
		if (!document.head) {
			return;
		}
		clearInterval(setupInterval);
		safari.self.tab.dispatchMessage(thisJSON.requestType, thisJSON);
		// since safari's built in extension stylesheets are treated as user stylesheets,
		// we can't inject them that way.  That makes them "user stylesheets" which would make
		// them require !important everywhere - we don't want that, so we'll inject this way instead.
		var loadCSS = function(filename) {
			var linkTag = document.createElement('link');
			linkTag.setAttribute('rel', 'stylesheet');
			linkTag.href = safari.extension.baseURI + filename;
			document.head.appendChild(linkTag);
		};

		// include CSS files, then load scripts.
		var cssFiles = ['css/res.css', 'vendor/guiders.css', 'vendor/tokenize.css'];
		for (var i in cssFiles) {
			loadCSS(cssFiles[i]);
		}
	};
	setupInterval = setInterval(setupCallback, 200);
	setupCallback();
};


RESEnvironment.sendMessage = function(thisJSON) {
	safari.self.tab.dispatchMessage(thisJSON.requestType, thisJSON);
};


RESEnvironment.openInNewWindow = function (thisHREF) {
	var thisJSON = {
		requestType: 'keyboardNav',
		linkURL: thisHREF
	};
	safari.self.tab.dispatchMessage('keyboardNav', thisJSON);
};

RESEnvironment.openLinkInNewTab = function (thisHREF) {
	var thisJSON = {
		requestType: 'openLinkInNewTab',
		linkURL: thisHREF
	};
	safari.self.tab.dispatchMessage('openLinkInNewTab', thisJSON);
};


RESEnvironment.addURLToHistory = RESEnvironment._addURLToHistory;
