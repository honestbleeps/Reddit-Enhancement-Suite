// if this is a jetpack addon, add an event listener like Safari's message handler...
self.on('message', function(msgEvent) {
	switch (msgEvent.name) {
		case 'readResource':
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



// GM_xmlhttpRequest for non-GM browsers
if (typeof GM_xmlhttpRequest === 'undefined') {
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

