
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
				BrowserStrategy._addURLToHistoryViaForeground(url);
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


BrowserStrategy.storageSetup = function(thisJSON) {
	RESLoadResourceAsText = function(filename, callback) {
		var f = opera.extension.getFile('/' + filename);
		var fr = new FileReader();
		fr.onload = function() {
			callback(fr.result);
		}
		fr.readAsText(f);
	};

	opera.extension.addEventListener("message", operaMessageHandler, false);
	// We're already loaded, call the handler immediately
	opera.extension.postMessage(JSON.stringify(thisJSON));
};

BrowserStrategy.RESInitReadyCheck = function(RESInit) {
	// require.js-like modular injected scripts, code via:
	// http://my.opera.com/BS-Harou/blog/2012/08/08/modular-injcted-scripts-in-extensions
	// Note: This code requires Opera 12.50 to run!
	if (typeof opera.extension.getFile === 'function') {
		var loadCSS = function(filename) {
			var fileObj = opera.extension.getFile('/' + filename);
			if (fileObj) {
				// Read out the File object as a Data URI:
				var fr = new FileReader();
				fr.onload = function() {
					// Load the library
					var styleTag = document.createElement("style");
					styleTag.textContent = fr.result;
					document.body.appendChild(styleTag);
				};
				fr.readAsText(fileObj);
			}
		};

		// include CSS files, then load scripts.
		var cssFiles = ['res.css', 'guiders.css', 'tokenize.css', 'commentBoxes.css', 'nightmode.css','players.css','batch.css'];
		for (var i in cssFiles) {
			loadCSS(cssFiles[i]);
		}

		(function() {
			var oex = opera.extension;

			var types = {
				'text': 'readAsText',
				'json': 'readAsText',
				'dataurl': 'readAsDataURL',
				'arraybuffer': 'readAsArrayBuffer'
			};

			if ('getFile' in oex && !('getFileData' in oex)) {
				oex.getFileData = function(path, type, cb) {
					if (typeof type === 'function') {
						cb = type;
						type = 'text';
					} else {
						type = type && type.toLowerCase();
						type = type in types ? type : 'text';
					}

					if (typeof cb !== 'function') {
						return;
					}

					var file = opera.extension.getFile(path);

					if (file) {
						var reader = new FileReader();

						reader.onload = function(e) {
							if (type === 'json') {
								try {
									cb(JSON.parse(reader.result), file);
								} catch (e) {
									cb(null);
								}
							} else {
								cb(reader.result, file);
							}
						};

						reader.onerror = function(e) {
							cb(null);
						};

						reader[types[type]](file);

					} else {
						setTimeout(cb, 0, null, file);
					}
				};
			}
		}());

		/**
		 * TODO: nothing
		 * better structure, less binding and fn arguments
		 * vylepsit cachovani (eg. dve stejne dependencies)
		 */

		var global = this;

		var require = (function() {
			function define(result, cb) {
				if (typeof result === 'function' || typeof cb !== 'function') {
					define.compiled = typeof result === 'undefined' ? null : result;
				} else {
					define._wait = true;

					// possible optimization - avoid calling require for falsy "result"
					// but watch out for timeout bug

					// result => path
					require(result, function(store) {
						var data = [].slice.call(arguments, 1); // get rid off "store" from arguments
						var item = store.pop();
						item.cb(cb.apply(global, data));
					}.bind(global, define._store));
				}
			}
			define.compiled = null;
			define._store = null;
			define._wait = false;

			return function() {
				function _compile() {
					define.compiled = null;
					define._store = arguments[1]._store; // arguments[1] = buffer
					with({}) eval(arguments[0]);
					if (define._wait) {
						define._wait = false;
						arguments[1]._store.push({
							//define._store.push({
							cb: arguments[3],
							path: arguments[4]
						});
						return false;
					} else {
						processData(define.compiled, arguments[1], arguments[2]);
						return true;
					}
				}

				function processData(data, buffer, i) {
					if (buffer.temp[i]) {
						delete buffer.temp[i];
					}

					buffer.add(data, i);

					var path = buffer.path;

					if (!(path[i] in require._cache) || (data && require._cache[path[i]] === null)) {
						require._cache[path[i]] = data;
					}

					var next = buffer.temp[i + 1];
					if (next) {
						if (!next.parsedPath[1]) {
							var isImmidiate = _compile(next.data, buffer, i + 1, next.cb, next.parsedPath[0]);
							if (!isImmidiate) {
								require._cache[next.path] = null;
							}
						} else {
							processData(next.data, buffer, i + 1);
						}
					}
				}

				function wait(buffer, cb) {
					// timeout is important for right order of callbacks reading from buffer
					setTimeout(function() {
						cb.apply(global, buffer);
					}, 0);
				}

				function compileCB(cb, buffer, i, data) {
					processData(data, buffer, i);

					if (buffer.length === buffer.path.length && cb) {
						wait(buffer, cb);
					}
				}

				function parsePath(path) {
					var parsedPath = path.split('!');

					// add '.js' as file extension
					if (!parsedPath[1] && path.indexOf(/\.js$/i) === -1) {
						parsedPath[0] = (path += '.js');
					}

					return parsedPath;
				}

				return function(path, cb) {
					// buffer will be served as an array of arguments to callback function
					var buffer = [];
					// special temp array to keep right order of execution and items in buffer
					buffer.temp = [];

					// this does not have anything to do with buffer .. it needs some renaming
					buffer._store = [];

					buffer.add = function(val, i) {
						if (this.length === i) {
							this.push(val);
							return true;
						}
						this.temp[i] = {
							data: val,
							cb: compileCB.bind(global, cb, buffer, i),
							parsedPath: parsePath(path[i]),
							path: path[i]
						};
						return false;
					};

					// if no files are given, return null
					if (!path.length) {
						wait(buffer, cb);
						return null;
					}

					// convert string path to array of one item
					if (!Array.isArray(path)) {
						path = [path];
					}

					buffer.path = path;

					// load all given files
					for (var i = 0, j = path.length; i < j; i++) {
						// Check for !domReady dependency
						if (path[i] === '!domReady') {
							// check if document is already loaded
							if (document.readyState === 'complete' || document.readyState === 'interactive') {
								processData(document, buffer, i);
							}
							// otherwise wait for it to get loaded
							else {
								document.addEventListener('DOMContentLoaded', function(i) {
									processData(document, buffer, i);

									// duplicitni s compileCB
									if (buffer.length === path.length && cb) {
										wait(buffer, cb);
									}
								}.bind(global, i)); // we have to bind "i"
							}
							continue;
						}

						// split path to two parts, before and after '!'
						var parsedPath = parsePath(path[i]);

						// check for falsy name
						if (!parsedPath[0]) {
							processData(null, buffer, i);
							continue;
						}

						// check if the resource isn't already in cache
						if (path[i] in require._cache) {
							processData(require._cache[path[i]], buffer, i);
							continue;
						}

						// load the file
						opera.extension.getFileData((require._base || '') + parsedPath[0], parsedPath[1] || 'text', function(i, parsedPath, data) {
							// check if the file was succesfully loaded
							if (data) {
								// if the file is javascript for execution
								if (!parsedPath[1]) {
									if (buffer.length === i) {
										// isImmidiate = no dependencies
										var isImmidiate = _compile(data, buffer, i, compileCB.bind(global, cb, buffer, i), parsedPath[0]);

										// if it has dependencies, set it the path temporary to null to prevent circural dependencies
										if (!isImmidiate) {
											require._cache[path[i]] = null;
											return;
										}
									} else {
										// this shouldn't happen .. contact me if it does
										if (buffer.length > i) {
											alert('oh shit, this should not happen!');
										}

										// we have to wait before this script can be executed
										// data will be added to buffer.temp for the right time
										processData(data, buffer, i);

										// end the function to prevent caching (nothing to be cached)
										return;
									}
								}
								// the file is not supposed to be executed
								else {
									processData(data, buffer, i);
								}
							}
							// otherwise add 'null' to buffer instead
							else {
								processData(null, buffer, i);
							}

							// if buffer contains all loaded files, call callback function
							if (buffer.length === path.length && cb) {
								wait(buffer, cb);
							}
						}.bind(global, i, parsedPath));
					}

					// if all files are in cache use return
					if (buffer.length === path.length) {
						if (cb) {
							wait(buffer, cb);
						}
						return buffer.length === 1 ? buffer[0] : buffer;
					}
				};
			}();
		}());

		// IMPORTANT! Creates cache and sets base folder
		require._cache = {};
		require._base = '/modules/';

		// save Reddit's jQuery, because this script is going to jack it up.
		// now, take the new jQuery in and store it local to RES's scope (it's a var up top)
		var redditJq = window.$;
		require(['jquery-1.10.2.min', 'guiders-1.2.8', 'tinycon', 'snuownd', 'jquery.dragsort-0.6', 'jquery.tokeninput', 'jquery-fieldselection.min'], function() {
			RESInit();
		});
	} else {
		RESInit();
	}
};


BrowserStrategy.sendMessage = function(thisJSON) {
	opera.extension.postMessage(JSON.stringify(thisJSON));
};

BrowserStrategy.getOutlineProperty = function() {
	return 'border';
};

BrowserStrategy.openNewWindow = function (thisHREF) {
	var thisJSON = {
		requestType: 'keyboardNav',
		linkURL: thisHREF
	};
	opera.extension.postMessage(JSON.stringify(thisJSON));
};

BrowserStrategy.openLinkInNewTab = function (thisHREF) {
	var thisJSON = {
		requestType: 'openLinkInNewTab',
		linkURL: thisHREF
	};
	opera.extension.postMessage(JSON.stringify(thisJSON));
};

BrowserStrategy.addURLToHistory = BrowserStrategy._addURLToHistory;

BrowserStrategy.supportsThirdPartyCookies = function() { return false; };
