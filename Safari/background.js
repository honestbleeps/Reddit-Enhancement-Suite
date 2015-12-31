/* global safari: false */

const XHRCache = {
	forceCache: false,
	capacity: 250,
	entries: new Map(),
	check(key) {
		if (this.entries.has(key)) {
			const entry = this.entries.get(key);
			entry.hits++;
			return entry.data;
		}
	},
	add(key, value) {
		if (this.entries.has(key)) {
			return;
		}

		this.entries.set(key, {
			data: value,
			timestamp: Date.now(),
			hits: 1
		});

		if (this.entries.size > this.capacity) {
			this.prune();
		}
	},
	prune() {
		const now = Date.now();
		const top = Array.from(this.entries.entries())
			.map(elem => {
				const [, { hits, timestamp }] = elem;
				// Weight by hits/age which is similar to reddit's hit/controversial sort orders
				return {
					elem,
					weight: hits / (now - timestamp)
				};
			})
			.sort(({ weight: a }, { weight: b }) => b - a) /* decreasing weight */
			.slice(0, (this.capacity / 2) | 0)
			.map(({ elem }) => elem);

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
 * Register a listener to be invoked whenever a message of <tt>type</tt> is received.
 * Responses may be sent synchronously or asynchronously:
 * If <tt>callback</tt> returns a non-promise value, a response will be sent synchronously.
 * If <tt>callback</tt> returns a promise, a response will be sent asynchronously when it resolves.
 * If it rejects, an invalid response will be sent.
 * @param {string} type
 * @param {MessageListener} callback
 * @throws {Error} If a listener for <tt>messageType</tt> already exists.
 * @returns {void}
 */
function addListener(type, callback) {
	if (listeners.has(type)) {
		throw new Error(`Listener for message type: ${type} already exists.`);
	}
	listeners.set(type, { callback });
}

/**
 * Sends a message to the content script proxy <tt>page</tt>.
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

safari.application.addEventListener('message', ({ name: type, message: { data, transaction, isError, isResponse }, target: tab}) => {
	if (isResponse) {
		if (!waiting.has(transaction)) {
			throw new Error(`No response handler for type: ${type}, transaction: ${transaction} - this should never happen.`);
		}

		const handler = waiting.get(transaction);
		waiting.delete(transaction);

		if (isError) {
			handler.reject(new Error(`Error in foreground handler for type: ${type}`));
		} else {
			handler.resolve(data);
		}

		return;
	}

	if (!listeners.has(type)) {
		throw new Error(`Unrecognised message type: ${type}`);
	}
	const listener = listeners.get(type);

	async function sendResponse({ data, isError }) {
		// this is ridiculous, Safari.
		(await nonNull(() => tab.page)).dispatchMessage(type, { data, transaction, isError, isResponse: true });
	}

	let response;

	try {
		response = listener.callback(data, tab);
	} catch (e) {
		sendResponse({ isError: true });
		throw e;
	}

	if (response instanceof Promise) {
		response
			.then(data => sendResponse({ data }))
			.catch(error => {
				sendResponse({ isError: true });
				throw error;
			});
		return true;
	}
	sendResponse({ data: response });
}, false);

// Listeners

addListener('ajax', async ({ method, url, headers, data, credentials, aggressiveCache }) => {
	const cachedResult = (aggressiveCache || XHRCache.forceCache) && XHRCache.check(url);

	if (cachedResult) {
		return cachedResult;
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

	// Only store `status`, `responseText` and `responseURL` fields
	const response = {
		status: request.status,
		responseText: request.responseText,
		responseURL: request.responseURL
	};

	// Only cache on HTTP OK and non empty body
	if ((aggressiveCache || XHRCache.forceCache) && response.status === 200 && response.responseText) {
		XHRCache.add(url, response);
	}

	return response;
});

addListener('getLocalStorage', () => {
	const ls = {};
	for (let i = 0, len = localStorage.length; i < len; i++) {
		if (localStorage.key(i)) {
			ls[localStorage.key(i)] = localStorage.getItem(localStorage.key(i));
		}
	}
	return ls;
});

addListener('saveLocalStorage', data => {
	for (const key in data) {
		localStorage.setItem(key, data[key]);
	}
	localStorage.setItem('importedFromForeground', true);
	return localStorage;
});

addListener('storage', async ({ operation, itemName, itemValue }, senderTab) => {
	switch (operation) {
		case 'getItem':
			return localStorage.getItem(itemName);
		case 'removeItem':
			return localStorage.removeItem(itemName);
		case 'setItem':
			localStorage.setItem(itemName, itemValue);
			return Promise.all(
				Array.from(safari.application.browserWindows)
					.map(w => Array.from(w.tabs))
					.reduce((acc, tabs) => acc.concat(tabs), [])
					.filter(tab => tab !== senderTab && tab.page)
					.map(({ page }) => sendMessage('storage', page, { itemName, itemValue }))
			);
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

addListener('XHRCache', ({ operation }) => {
	switch (operation) {
		case 'clear':
			XHRCache.clear();
			break;
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
