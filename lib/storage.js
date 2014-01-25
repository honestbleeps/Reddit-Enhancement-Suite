RESStorage = {};

function setUpRESStorage(response) {
	RESStorage = response;

	// We'll set up a method for getItem, but it's not adviseable to use since
	// it's asynchronous...
	RESStorage.getItem = function(key) {
		if (typeof RESStorage[key] !== 'undefined') {
			return RESStorage[key];
		}
		return null;
	};

	// If the fromBG parameter is true, we've been informed by another tab
	// that this item has updated. We should update the data locally, but
	// not send a background request.
	RESStorage.setItem = function(key, value, fromBG) {
		// Protect from excessive disk I/O...
		if (RESStorage[key] !== value) {
			// Save it locally in the RESStorage variable, but also write it
			// to the extension's localStorage...
			// It's OK that saving it is asynchronous since we're saving it
			// in this local variable, too...
			RESStorage[key] = value;
			var thisJSON = {
				requestType: 'localStorage',
				operation: 'setItem',
				itemName: key,
				itemValue: value
			};

			if (!fromBG) {
				RESUtils.sendMessage(thisJSON);
			}
		}
	};

	RESStorage.removeItem = function(key) {
		// Delete it locally in the RESStorage variable, but also delete it
		// from the extension's localStorage...
		// It's OK that deleting it is asynchronous since we're deleting it in
		// this local variable, too...
		delete RESStorage[key];
		var thisJSON = {
			requestType: 'localStorage',
			operation: 'removeItem',
			itemName: key
		};

		RESUtils.sendMessage(thisJSON);
	};

	window.localStorage = RESStorage;
	//RESInit();

	RESdoBeforeLoad();
}

(function(u) {
	// Don't fire the script on the iframe. This annoyingly fires this whole thing twice. Yuck.
	// Also don't fire it on static.reddit or thumbs.reddit, as those are just images.
	// Also omit blog and code.reddit
	if ((typeof RESRunOnce !== 'undefined') ||
			(/\/toolbar\/toolbar\?id/i.test(location.href)) ||
			(/comscore-iframe/i.test(location.href)) ||
			(/(?:static|thumbs|blog|code)\.reddit\.com/i.test(location.hostname)) ||
			(/[www\.]?(?:i|m)\.reddit\.com/i.test(location.href)) ||
			(/\.(?:compact|mobile)$/i.test(location.pathname)) ||
			(/metareddit\.com/i.test(location.href))) {
		// do nothing.
		return false;
	}

	// call preInit function - work in this function should be kept minimal.  It's for
	// doing stuff as early as possible prior to pageload, and even prior to the localStorage copy
	// from the background.
	// Specifically, this is used to add a class to the document for .res-nightmode, etc, as early
	// as possible to avoid the flash of unstyled content.
	RESUtils.preInit();

	RESRunOnce = true;
	var thisJSON = {
		requestType: 'getLocalStorage'
	};

	if (BrowserDetect.isChrome()) {
		window.RESLoadResourceAsText = function(filename, callback) {
			var xhr = new XMLHttpRequest();
			xhr.onload = function() {
				if (callback) {
					callback(this.responseText);
				}
			};
			var id = chrome.i18n.getMessage("@@extension_id");
			xhr.open('GET', 'chrome-extension://' + id + '/' + filename);
			xhr.send();
		};

		// we've got chrome, get a copy of the background page's localStorage first, so don't init until after.
		chrome.runtime.sendMessage(thisJSON, function(response) {
			// Does RESStorage have actual data in it?  If it doesn't, they're a legacy user, we need to copy 
			// old school localStorage from the foreground page to the background page to keep their settings...
			if (typeof response.importedFromForeground === 'undefined') {
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
					setUpRESStorage(response);
				});
			} else {
				setUpRESStorage(response);
			}
		});
	} else if (BrowserDetect.isSafari()) {
		var setupInterval;
		window.RESLoadResourceAsText = function(filename, callback) {
			var url = safari.extension.baseURI + filename;

			GM_xmlhttpRequest({
				method: 'GET',
				url: url,
				onload: function (response) {
					callback(response.responseText);
				}
			});
		};

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
			var cssFiles = ['res.css', 'guiders.css', 'tokenize.css', 'commentBoxes.css', 'nightmode.css','fitbamob.css','batch.css'];
			for (var i in cssFiles) {
				loadCSS(cssFiles[i]);
			}
		};
		setupInterval = setInterval(setupCallback, 200);
		setupCallback();
	} else if (BrowserDetect.isFirefox()) {
		var transactions = 0;
		window.RESLoadCallbacks = [];
		window.RESLoadResourceAsText = function(filename, callback) {
			window.RESLoadCallbacks[transactions] = callback;
			self.postMessage({ requestType: 'readResource', filename: filename, transaction: transactions });
			transactions++;
		};
		// we've got firefox jetpack, get localStorage from background process
		self.postMessage(thisJSON);
	} else if (BrowserDetect.isOpera()) {
		// I freaking hate having to use different code that won't run in other browsers to log debugs, so I'm overriding console.log with opera.postError here
		// so I don't have to litter my code with different statements for different browsers when debugging.
		window.RESLoadResourceAsText = function(filename, callback) {
			var xhr = new XMLHttpRequest();
			xhr.onload = function() {
				if (callback) {
					callback(this.responseText);
				}
			};
			var id = chrome.i18n.getMessage("@@extension_id");
			xhr.open('GET', 'chrome-extension://' + id + '/' + filename);
			xhr.send();
		};
		console.log = opera.postError;
		opera.extension.addEventListener("message", operaMessageHandler, false);
		window.addEventListener("DOMContentLoaded", function(u) {
			// we've got opera, let's check for old localStorage...
			// RESInit() will be called from operaMessageHandler()
			opera.extension.postMessage(JSON.stringify(thisJSON));
		}, false);
	}
})();

function RESInitReadyCheck() {
	if (
		(typeof RESStorage.getItem !== 'function') ||
		(typeof document.body === 'undefined') ||
		(!document.html) ||
		(typeof document.html.classList === 'undefined')
	) {
		setTimeout(RESInitReadyCheck, 50);
	} else {
		if (BrowserDetect.isFirefox()) {
			// firefox addon sdk... we've included jQuery... 
			// also, for efficiency, we're going to try using unsafeWindow for "less secure" (but we're not going 2 ways here, so that's OK) but faster DOM node access...
			document = unsafeWindow.document;
			window = unsafeWindow;
			if (typeof $ !== 'function') {
				console.log('Uh oh, something has gone wrong loading jQuery...');
			}
		} else if (typeof window.jQuery === 'function') {
			// opera...
			$ = window.jQuery;
			jQuery = $;
		} else {
			// chrome and safari...
			if (typeof $ !== 'function') {
				console.log('Uh oh, something has gone wrong loading jQuery...');
			}
		}
		if (BrowserDetect.isOpera()) {
			// require.js-like modular injected scripts, code via:
			// http://my.opera.com/BS-Harou/blog/2012/08/08/modular-injcted-scripts-in-extensions
			// Note: This code requires Opera 12.50 to run!
			if (typeof opera.extension.getFile === 'function') {
				var loadCSS = function(filename) {
					var fileObj = opera.extension.getFile(filename);
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
				var cssFiles = ['res.css', 'commentBoxes.css', 'nightmode.css','fitbamob.css','batch.css'];
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
					$ = window.$;
					jQuery = window.jQuery;
					guiders = window.guiders;
					Tinycon = window.Tinycon;
					SnuOwnd = window.SnuOwnd;
					// now, return the window.$ / window.jQuery back to its original state.
					window.$ = redditJq;
					window.jQuery = redditJq;
					RESInit();
				});
			} else {
				RESInit();
			}
		} else {
			$(document).ready(RESInit);
		}
	}
}

window.addEventListener('load', RESInitReadyCheck, false);
