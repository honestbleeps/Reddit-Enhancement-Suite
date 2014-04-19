
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

if (typeof GM_xmlhttpRequest === 'undefined') {
	if (BrowserDetect.isOpera()) {
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
	}
}


function operaUpdateCallback(obj) {
	RESUtils.compareVersion(obj);
}

function operaForcedUpdateCallback(obj) {
	RESUtils.compareVersion(obj, true);
}
