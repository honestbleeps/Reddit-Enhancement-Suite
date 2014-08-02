// if this is a jetpack addon, add an event listener like Safari's message handler...
self.on('message', function(msgEvent) {
	switch (msgEvent.name) {
		case 'readResource':
			window.RESLoadCallbacks[msgEvent.transaction](msgEvent.data);
			delete window.RESLoadCallbacks[msgEvent.transaction];
			break;
		case 'ajax':
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


BrowserStrategy.ajax = function(obj) {
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
		request.send(obj.data);
		return request;
	}
};


BrowserStrategy.localStorageTest = function() {
	// if this is a firefox addon, check for the old lsTest to see if they used to use the Greasemonkey script...
	// if so, present them with a notification explaining that they should download a new script so they can
	// copy their old settings...

	if ((localStorage.getItem('RES.lsTest') === 'test') && (localStorage.getItem('copyComplete') !== 'true')) {
		modules['notifications'].showNotification('<h2>Important Alert for Greasemonkey Users!</h2>Hey! It looks like you have upgraded to RES 4.0, but used to use the Greasemonkey version of RES. You\'re going to see double until you uninstall the Greasemonkey script. However, you should first copy your settings by clicking the blue button. <b>After installing, refresh this page!</b> <a target="_blank" class="RESNotificationButtonBlue" href="http://redditenhancementsuite.com/gmutil/reddit_enhancement_suite.user.js">GM->FF Import Tool</a>', 15000);
		localStorage.removeItem('RES.lsTest');

		// this is the only "old school" DOMNodeInserted event left... note to readers of this source code:
		// it will ONLY ever be added to the DOM in the specific instance of former OLD RES users from Greasemonkey
		// who haven't yet had the chance to copy their settings to the XPI version of RES.  Once they've completed
		// that, this eventlistener will never be added again, nor will it be added for those who are not in this
		// odd/small subset of people.
		document.body.addEventListener('DOMNodeInserted', function(event) {
			if ((event.target.tagName === 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('copyToSimpleStorage') !== -1)) {
				GMSVtoFFSS();
			}
		}, true);
	}
};

BrowserStrategy.storageSetup = function(thisJSON) {
	var transactions = 0;
	window.RESLoadCallbacks = [];
	RESLoadResourceAsText = function(filename, callback) {
		window.RESLoadCallbacks[transactions] = callback;
		self.postMessage({ requestType: 'readResource', filename: filename, transaction: transactions });
		transactions++;
	};
	// we've got firefox jetpack, get localStorage from background process
	self.postMessage(thisJSON);
};

BrowserStrategy.RESInitReadyCheck = (function() {
	var original = BrowserStrategy.RESInitReadyCheck;

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

BrowserStrategy.openInNewWindow = function(thisHREF) {
	var thisJSON = {
		requestType: 'keyboardNav',
		linkURL: thisHREF
	};
	self.postMessage(thisJSON);
};

BrowserStrategy.openLinkInNewTab = function(thisHREF) {
	var thisJSON = {
		requestType: 'openLinkInNewTab',
		linkURL: thisHREF
	};
	self.postMessage(thisJSON);
};

BrowserStrategy.sendMessage = function(thisJSON) {
	self.postMessage(thisJSON);
};
