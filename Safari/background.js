/* global safari: false */

const XHRCache = {
	capacity: 250,
	entries: new Map(),
	check(key, maxAge = Infinity) {
		const entry = this.entries.get(key);
		if (entry && (Date.now() - entry.timestamp < maxAge)) {
			entry.hits++;
			return entry.data;
		}
	},
	set(key, value) {
		let hits = 1;

		if (this.entries.has(key)) {
			hits = this.entries.get(key).hits;
		}

		this.entries.set(key, {
			data: value,
			timestamp: Date.now(),
			hits
		});

		if (this.entries.size > this.capacity) {
			this.prune();
		}
	},
	delete(key) {
		this.entries.delete(key);
	},
	prune() {
		const now = Date.now();
		const top = Array.from(this.entries.entries())
			.sort(([, a], [, b]) => {
				const aWeight = a.hits / (now - a.timestamp);
				const bWeight = b.hits / (now - b.timestamp);
				return bWeight - aWeight; // in order of decreasing weight
			})
			.slice(0, (this.capacity / 2) | 0);

		this.entries = new Map(top);
	},
	clear() {
		this.entries.clear();
	}
};

const listeners = new Map();
const waiting = new Map();
let transaction = 0;

/**
 * @callback MessageListener
 * @template T
 * @param {*} data The message data.
 * @param {SafariBrowserTab} tab The tab that sent the message.
 * @returns {T|Promise<T, *>} The response data, optionally wrapped in a promise.
 */

/**
 * Register a listener to be invoked whenever a message of `type` is received.
 * Responses may be sent synchronously or asynchronously:
 * If `callback` returns a non-promise value, a response will be sent synchronously.
 * If `callback` returns a promise, a response will be sent asynchronously when it resolves.
 * If it rejects, an invalid response will be sent.
 * @param {string} type
 * @param {MessageListener} callback
 * @throws {Error} If a listener for `messageType` already exists.
 * @returns {void}
 */
function addListener(type, callback) {
	if (listeners.has(type)) {
		throw new Error(`Listener for message type: ${type} already exists.`);
	}
	listeners.set(type, { callback });
}

/**
 * Sends a message to the content script proxy `page`.
 * @param {string} type
 * @param {SafariWebPageProxy} page
 * @param {*} [data]
 * @returns {Promise<*, Error>} Rejects if an invalid response is received,
 * resolves with the response data otherwise.
 */
function sendMessage(type, page, data) {
	++transaction;

	page.dispatchMessage(type, { data, transaction });

	return new Promise((resolve, reject) => waiting.set(transaction, { resolve, reject }));
}

function nonNull(callback) {
	return new Promise(resolve => {
		(function repeat() {
			let val;
			if (!(val = callback())) {
				return setTimeout(repeat, 1);
			}
			resolve(val);
		})();
	});
}

safari.application.addEventListener('message', ({ name: type, message: { data, transaction, error, isResponse }, target: tab}) => {
	if (isResponse) {
		if (!waiting.has(transaction)) {
			throw new Error(`No response handler for type: ${type}, transaction: ${transaction} - this should never happen.`);
		}

		const handler = waiting.get(transaction);
		waiting.delete(transaction);

		if (error) {
			handler.reject(new Error(`Error in foreground handler for type: ${type} - message: ${error}`));
		} else {
			handler.resolve(data);
		}

		return;
	}

	if (!listeners.has(type)) {
		throw new Error(`Unrecognised message type: ${type}`);
	}
	const listener = listeners.get(type);

	async function sendResponse({ data, error }) {
		// this is ridiculous, Safari.
		(await nonNull(() => tab.page)).dispatchMessage(type, { data, transaction, error, isResponse: true });
	}

	let response;

	try {
		response = listener.callback(data, tab);
	} catch (e) {
		sendResponse({ error: e.message || e });
		throw e;
	}

	if (response instanceof Promise) {
		response
			.then(data => sendResponse({ data }))
			.catch(e => {
				sendResponse({ error: e.message || e });
				throw e;
			});
		return true;
	}
	sendResponse({ data: response });
}, false);

// Listeners

addListener('ajax', async ({ method, url, headers, data, credentials }) => {
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

	// Only store `status`, `responseText` and `responseURL` fields
	return {
		// Safari doesn't set status on requests for local resources...
		status: request.status === 0 ? 200 : request.status,
		responseText: request.responseText,
		responseURL: request.responseURL
	};
});

// Circular references can't exist in storage, so we don't need to consider that
// and only enumerable own properties are sent in messages
function extend(target, source) {
	for (const key in source) {
		if (target[key] && source[key] && typeof target[key] === 'object' && typeof source[key] === 'object') {
			extend(target[key], source[key]);
		} else {
			target[key] = source[key];
		}
	}
	return target;
}

addListener('storage', ([operation, key, value]) => {
	switch (operation) {
		case 'get':
			try {
				return JSON.parse(localStorage.getItem(key));
			} catch (e) {
				console.warn('Failed to parse:', key, e);
			}
			return null;
		case 'getRaw':
			return localStorage.getItem(key);
		case 'set':
			return localStorage.setItem(key, JSON.stringify(value));
		case 'setRaw':
			return localStorage.setItem(key, value);
		case 'patch':
			try {
				const stored = JSON.parse(localStorage.getItem(key)) || {};
				localStorage.setItem(key, JSON.stringify(extend(stored, value)));
			} catch (e) {
				throw new Error(`Failed to patch: ${key} - error: ${e}`);
			}
			break;
		case 'deletePath':
			try {
				const stored = JSON.parse(localStorage.getItem(key)) || {};
				value.split(',').reduce((obj, key, i, { length }) => {
					if (i < length - 1) return obj[key];
					delete obj[key];
				}, stored);
				localStorage.setItem(key, JSON.stringify(stored));
			} catch (e) {
				throw new Error(`Failed to delete path: ${value} on key: ${key} - error: ${e}`);
			}
			break;
		case 'delete':
			return localStorage.removeItem(key);
		case 'has':
			return key in localStorage;
		case 'keys':
			return Object.keys(localStorage);
	}
});

const session = new Map();

addListener('session', ([operation, key, value]) => {
	switch (operation) {
		case 'get':
			return session.get(key);
		case 'set':
			session.set(key, value);
			break;
		case 'delete':
			return session.delete(key);
		case 'clear':
			return session.clear();
	}
});

addListener('openNewTabs', ({ urls, focusIndex }, tab) => {
	// Really? No SafariBrowserTab::index?
	let currentIndex = Array.from(tab.browserWindow.tabs).findIndex(t => t === tab);
	if (currentIndex === -1) currentIndex = 2 ** 50; // 7881299347898367 more tabs may be safely opened
	urls.forEach((url, i) =>
		tab.browserWindow.openTab(
			i === focusIndex ? 'foreground' : 'background',
			++currentIndex
		).url = url
	);
});

addListener('XHRCache', ({ operation, key, value, maxAge }) => {
	switch (operation) {
		case 'set':
			return XHRCache.set(key, value);
		case 'check':
			return XHRCache.check(key, maxAge);
		case 'delete':
			return XHRCache.delete(key);
		case 'clear':
			return XHRCache.clear();
	}
});

addListener('isPrivateBrowsing', (request, tab) => tab.private);

addListener('multicast', async (request, senderTab) =>
	Promise.all(
		Array.from(safari.application.browserWindows)
			.map(w => Array.from(w.tabs))
			.reduce((acc, tabs) => acc.concat(tabs), [])
			.filter(tab => tab !== senderTab && tab.private === senderTab.private && tab.page)
			.map(({ page }) => sendMessage('multicast', page, request))
	)
);
