/* exported RESEnvironment, BrowserDetect */

const RESEnvironment = {
	/**
	 * @returns {Storage} The content script's localstorage object, or <tt>undefined</tt> if none exists.
	 */
	localStorage: RESUtils.once(() =>
		typeof unsafeWindow !== 'undefined' && unsafeWindow.localStorage ||
		typeof localStorage !== 'undefined' && localStorage ||
		typeof window !== 'undefined' && window.localStorage ||
		undefined
	),
	/**
	 * @returns {Location} The content script's location object.
     */
	location() {
		return location;
	},
	/**
	 * @returns {MutationObserver} The content script's MutationObserver object, or <tt>undefined</tt> if none exists.
	 */
	getMutationObserver: RESUtils.once(() =>
		window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || undefined
	),
	/**
	 * Only implemented in Safari, where it removes a leading "s"...
	 * @param {string} data
	 * @returns {string}
     */
	sanitizeJSON(data) {
		return data;
	},
	/**
	 * @param {string} markup
	 * @returns {Document}
	 */
	parseHtmlAsDocument: (() => {
		let domParserCanHandleHtml = false;

		try {
			if ((new DOMParser()).parseFromString('<html />', 'text/html')) {
				// text/html parsing is natively supported
				// Expected to work in Firefox, Chrome, OperaBlink, Opera, Safari 7
				// Not expected to work in Safari ... 6?
				domParserCanHandleHtml = true;
			}
		} catch (ex) {
			// ignore
		}

		return markup => {
			let doc;
			if (domParserCanHandleHtml) {
				doc = (new DOMParser()).parseFromString(markup, 'text/html');
			} else {
				doc = document.implementation.createHTMLDocument('');
				if (markup.toLowerCase().indexOf('<!doctype') !== -1) {
					doc.documentElement.innerHTML = markup;
				} else {
					doc.body.innerHTML = markup;
				}
			}
			return doc;
		};
	})(),
	/**
	 * Sends a same-origin or cross-origin XHR.
	 *
	 * @param {string} [method='GET']
	 * @param {string} url May be a relative URL, appending any part of the current location is unnecessary.
	 * @param {object} [headers] A collection of name-value pairs.
	 * The Content-Type header defaults to application/x-www-form-urlencoded for POST requests.
	 * The X-Modhash header defaults to the current user's modhash for same-origin POST requests.
	 * @param {object|string} [data] If passed an object, will be encoded and converted to a query string. Appended to the url for GET requests.
	 * @param {string} [type='text'] Affects the return value. One of 'text' (for responseText), 'json' (responseText parsed as JSON), or 'raw' (the entire XHR object).
	 * Only the responseText and status fields are guaranteed to be present for cross-origin requests.
	 * @param {boolean} [credentials=false]
	 * @param {boolean} [aggressiveCache=false] Currently only affects cross-origin requests.
     * @returns {Promise<string|!Object|XMLHttpRequest, Error>} Resolves if a response with status 200 is recieved (and parsing succeeds, for 'json' requests).
	 * Rejects otherwise.
     */
	async ajax({ method = 'GET', url, headers = {}, data = {}, type = 'text', credentials = false, aggressiveCache = false }) {
		// Expand relative URLs
		url = new URL(url, location.href).href;

		// Convert data object to query string
		if ($.isPlainObject(data)) {
			data = $.map(data, (value, key) => RESUtils.string.encode`${key}=${value}`).join('&');
		}
		// Append data query string to URL for GET requests
		if (method === 'GET' && typeof data === 'string' && data) {
			url += (url.includes('?') ? '&' : '?') + data;
		}

		// Default POST content type
		if (method === 'POST' && !('Content-Type' in headers)) {
			headers['Content-Type'] = 'application/x-www-form-urlencoded';
		}

		let response;

		if (!url.includes(location.hostname)) {
			response = await RESEnvironment._sendMessage('ajax', { method, url, headers, data, credentials, aggressiveCache });
		} else {
			// Add `app=res`
			url = RESUtils.insertParam(url, 'app', 'res');

			// Automatically send modhash for same-domain POST requests
			if (method === 'POST' && !('X-Modhash' in headers)) {
				headers['X-Modhash'] = RESUtils.loggedInUserHash();
			}

			const request = new XMLHttpRequest();

			const load = Promise.race([
				new Promise(resolve => request.onload = resolve),
				new Promise(resolve => request.onerror = resolve)
					.then(() => { throw new Error(`XHR error - url: ${url}`); })
			]);

			request.open(method, url, true);

			for (const name in headers) {
				request.setRequestHeader(name, headers[name]);
			}

			if (credentials) {
				request.withCredentials = true;
			}

			request.send(data);

			await load;

			response = request;
		}

		if (response.status !== 200) {
			throw new Error(`XHR status ${response.status} - url: ${url}`);
		}

		switch (type) {
			case 'text':
				return response.responseText;
			case 'json':
				return JSON.parse(response.responseText);
			case 'raw':
				return response;
			default:
				throw new Error(`Invalid type: ${type}`);
		}
	},
	/**
	 * @param {string} filename
	 * @returns {Promise<string, *>}
     */
	loadResourceAsText(filename) {
		throw new Error('loadResourceAsText() is not implemented');
	},
	permissions: {
		/**
		 * @param {...string} perms Optional Chrome permissions to request.
		 * @returns {Promise<void, *>} Resolves if the permissions are granted, rejects otherwise.
		 */
		request(...perms) {
			return Promise.resolve();
		},
		/**
		 * @param {...string} perms Optional Chrome permissions to remove.
		 * @returns {Promise<void, *>} Resolves if the permissions are removed, rejects otherwise.
		 */
		remove(...perms) {
			return Promise.resolve();
		}
	},
	/**
	 * @param {...string} cookieNames
	 * @returns {Promise<void, *>}
     */
	deleteCookies(...cookieNames) {
		return RESEnvironment._sendMessage('deleteCookies', cookieNames.map(name => ({
			url: location.protocol + '//' + location.host,
			name
		})));
	},
	/**
	 * @returns {Promise<boolean, *>}
	 */
	isPrivateBrowsing: RESUtils.once(() =>
		RESEnvironment._sendMessage('isPrivateBrowsing')
	),
	/**
	 * Noop if private browsing is enabled.
	 * @param {string} url
	 * @returns {Promise<void, *>}
     */
	async addURLToHistory(url) {
		if (!(await RESEnvironment.isPrivateBrowsing())) {
			await RESEnvironment._sendMessage('addURLToHistory', url);
		}
	},
	/**
	 * Calls <tt>modules[moduleID][method](...args)</tt> in all other tabs.
	 * @template T
	 * @param {string} moduleID
	 * @param {string} method
	 * @param {...*} args
     * @returns {Promise<T[], *>} An array of results from all other tabs, in no specified order.
     */
	multicast(moduleID, method, ...args) {
		return RESEnvironment._sendMessage('multicast', { moduleID, method, args });
	},
	/**
	 * @param {string} url
	 * @param {boolean} [focus=true]
	 * @returns {Promise<void, *>} Resolves when the tab is opened.
     */
	openNewTab(url, focus = true) {
		return RESEnvironment.openNewTabs(focus, url);
	},
	/**
	 * @param {string|boolean} focus One of 'first', 'last' (or true), 'none' (or false)
	 * @param {...string} urls May be relative, appending any part of the current location is unnecessary.
	 * @returns {Promise<void, *>} Resolves when the tabs are opened.
     */
	openNewTabs(focus, ...urls) {
		let focusIndex;

		if (typeof focus !== 'string') focus = !!focus;

		switch (focus) {
			case 'first':
				focusIndex = 0;
				break;
			case true:
			case 'last':
				focusIndex = urls.length - 1;
				break;
			case false:
			case 'none':
				focusIndex = -1;
				break;
			default:
				throw new Error(`Invalid focus specified: ${focus}`);
		}

		// Expand relative URLs
		urls = urls.map(url => new URL(url, location.href).href);

		return RESEnvironment._sendMessage('openNewTabs', { urls, focusIndex });
	},
	pageAction: {
		/**
		 * @param {boolean} [state=false]
		 * @returns {Promise<void, *>}
		 */
		show(state = false) {
			return RESEnvironment._sendMessage('pageAction', { operation: 'show', state });
		},
		/**
		 * @returns {Promise<void, *>}
		 */
		hide() {
			return RESEnvironment._sendMessage('pageAction', { operation: 'hide' });
		},
		/**
		 * @returns {Promise<void, *>}
		 */
		destroy() {
			return RESEnvironment._sendMessage('pageAction', { operation: 'destroy' });
		}
	},
	/*
	 * The backend must guarantee that transaction ordering is preserved, i.e. this will log "bar" as expected:
	 * RESEnvironment.storage.set('foo', 'bar');
	 * RESEnvironment.storage.get('foo').then(::console.log);
	 *
	 * Requests are not batched, since that appears to drastically reduce performance.
	 */
	storage: {
		/**
		 * @param {string} key
		 * @returns {Promise<string|null, *>}
		 */
		get(key) {
			return RESEnvironment._sendMessage('storage', ['get', key]);
		},
		/**
		 * @param {string} key
		 * @param {*} [value]
		 * @returns {Promise<void, *>}
		 */
		set(key, value) {
			return RESEnvironment._sendMessage('storage', ['set', key, value]);
		},
		/**
		 * @param {string} key
		 * @returns {Promise<void, *>}
		 */
		remove(key) {
			return RESEnvironment._sendMessage('storage', ['remove', key]);
		},
		/**
		 * @param {string} key
		 * @returns {Promise<boolean, *>}
		 */
		has(key) {
			return RESEnvironment._sendMessage('storage', ['has', key]);
		},
		/**
		 * @returns {Promise<string[], *>}
		 */
		keys() {
			return RESEnvironment._sendMessage('storage', ['keys']);
		}
	},
	xhrCache: {
		/**
		 * @returns {Promise<void, *>}
		 */
		clear() {
			return RESEnvironment._sendMessage('XHRCache', { operation: 'clear' });
		}
	},
	/**
	 * For internal use only.
	 * @private
	 * @param {string} type
	 * @param {*} [data]
	 * @returns {Promise<*, *>}
     */
	_sendMessage(type, data) {
		throw new Error('_sendMessage() is not implemented');
	},
	/**
	 * Called by each browsersupport-browser.js file to add message listeners to the foreground.
	 * @template T
	 * @param {function(string, function(*): (T|Promise<T, *>)): void} addListener
	 * @returns {void}
     */
	_addSharedListeners(addListener) {
		addListener('multicast', ({ moduleID, method, args }) => RESUtils.rpc(moduleID, method, args));

		addListener('pageActionClick', () => {
			const toggle = !modules['styleTweaks'].isSubredditStyleEnabled();
			modules['styleTweaks'].toggleSubredditStyle(toggle, RESUtils.currentSubreddit());
		});
	}
};

const BrowserDetect = {
	init: function() {
		if (typeof navigator === 'undefined') {
			return;
		}
		this.browser = this.searchString(this.dataBrowser()) || 'An unknown browser';
		this.version = this.searchVersion(navigator.userAgent) ||
			this.searchVersion(navigator.appVersion) ||
			'an unknown version';
		this.OS = this.searchString(this.dataOS()) || 'an unknown OS';
	},
	searchString: function(datas) {
		var data = datas.find(function(data) {
			this.versionSearchString = data.versionSearch || data.identity;
			return (data.string && data.string.indexOf(data.subString) !== -1) ||
				data.prop;
		}, this);

		return data ? data.identity : undefined;
	},
	searchVersion: function(dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index === -1) {
			return;
		}
		return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
	},
	isChrome: function() {
		return typeof chrome !== 'undefined';
	},
	isFirefox: function() {
		return typeof self !== 'undefined' && typeof self.on === 'function';
	},
	isOperaBlink: function() {
		return typeof chrome !== 'undefined' && BrowserDetect.browser === 'Opera';
	},
	isSafari: function() {
		return typeof safari !== 'undefined';
	},
	dataBrowser: function() {
		return [
			{
				string: navigator.userAgent,
				subString: 'OPR/',
				identity: 'Opera'
			}, {
				string: navigator.userAgent,
				subString: 'Chrome',
				identity: 'Chrome'
			}, {
				string: navigator.userAgent,
				subString: 'OmniWeb',
				versionSearch: 'OmniWeb/',
				identity: 'OmniWeb'
			}, {
				string: navigator.vendor,
				subString: 'Apple',
				identity: 'Safari',
				versionSearch: 'Version'
			}, {
				prop: window.opera,
				identity: 'Opera',
				versionSearch: 'Version'
			}, {
				string: navigator.vendor,
				subString: 'iCab',
				identity: 'iCab'
			}, {
				string: navigator.vendor,
				subString: 'KDE',
				identity: 'Konqueror'
			}, {
				string: navigator.userAgent,
				subString: 'Firefox',
				identity: 'Firefox'
			}, {
				string: navigator.vendor,
				subString: 'Camino',
				identity: 'Camino'
			}, { // for newer Netscapes (6+)
				string: navigator.userAgent,
				subString: 'Netscape',
				identity: 'Netscape'
			}, {
				string: navigator.userAgent,
				subString: 'MSIE',
				identity: 'Explorer',
				versionSearch: 'MSIE'
			}, {
				string: navigator.userAgent,
				subString: 'Gecko',
				identity: 'Mozilla',
				versionSearch: 'rv'
			}, {
				// for older Netscapes (4-)
				string: navigator.userAgent,
				subString: 'Mozilla',
				identity: 'Netscape',
				versionSearch: 'Mozilla'
			}
		];
	},
	dataOS: function() {
		return [
			{
				string: navigator.platform,
				subString: 'Win',
				identity: 'Windows'
			}, {
				string: navigator.platform,
				subString: 'Mac',
				identity: 'Mac'
			}, {
				string: navigator.userAgent,
				subString: 'iPhone',
				identity: 'iPhone/iPod'
			}, {
				string: navigator.platform,
				subString: 'Linux',
				identity: 'Linux'
			}
		];
	}
};

BrowserDetect.init();

if (typeof exports === 'object') {
	exports.RESEnvironment = RESEnvironment;
	exports.BrowserDetect = BrowserDetect;
}
