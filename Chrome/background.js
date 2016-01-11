/*

	RES is released under the GPL. However, I do ask a favor (obviously I don't/can't require it, I ask out of courtesy):

	Because RES auto updates and is hosted from a central server, I humbly request that if you intend to distribute your own
	modified Reddit Enhancement Suite, you name it something else and make it very clear to your users that it's your own
	branch and isn't related to mine.

	RES is updated very frequently, and I get lots of tech support questions/requests from people on outdated versions. If
	you're distributing RES via your own means, those recipients won't always be on the latest and greatest, which makes
	it harder for me to debug things and understand (at least with browsers that auto-update) whether or not people are on
	a current version of RES.

	I can't legally hold you to any of this - I'm just asking out of courtesy.

	Thanks, I appreciate your consideration.  Without further ado, the all-important GPL Statement:

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

/* global chrome: false */

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

function apiToPromise(func) {
	return (...args) =>
		new Promise((resolve, reject) =>
			func(...args, (...results) => {
				if (chrome.runtime.lastError) {
					reject(new Error(chrome.runtime.lastError.message));
				} else {
					resolve(results.length > 1 ? results : results[0]);
				}
			})
		);
}

const listeners = new Map();

/**
 * @callback MessageListener
 * @template T
 * @param {*} data The message data.
 * @param {Tab} tab The tab object of the sender.
 * @returns {T|Promise<T, *>} The response data, optionally wrapped in a promise.
 */

/**
 * Register a listener to be invoked whenever a message of `type` is received.
 * Responses may be sent synchronously or asynchronously:
 * If `callback` returns a non-promise value, a response will be sent synchronously.
 * If `callback` returns a promise, a response will be sent asynchronously when it resolves.
 * If it rejects, an invalid response will be sent to close the message channel.
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
 * Send a message to the content script at `tabId`.
 * @param {string} type
 * @param {number|string} tabId
 * @param {*} [data]
 * @returns {Promise<*, Error>} Rejects if an invalid response is received,
 * resolves with the response data otherwise.
 */
async function sendMessage(type, tabId, data) {
	const message = { type, data };
	const target = parseInt(tabId, 10);

	const response = await apiToPromise(chrome.tabs.sendMessage)(target, message);

	if (!response) {
		throw new Error(`Error in foreground handler for type: ${type}`);
	}

	return response.data;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	const { type, data } = request;
	const tab = sender.tab;

	if (!listeners.has(type)) {
		throw new Error(`Unrecognised message type: ${type}`);
	}
	const listener = listeners.get(type);

	let response;

	try {
		response = listener.callback(data, tab);
	} catch (e) {
		sendResponse();
		throw e;
	}

	if (response instanceof Promise) {
		response
			.then(data => sendResponse({ data }))
			.catch(error => {
				sendResponse();
				throw error;
			});
		return true;
	}
	sendResponse({ data: response });
});

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

addListener('permissions', async ({ operation, permissions, origins }, { id: tabId }) => {
	switch (operation) {
		case 'request':
			const hasPermissions = await apiToPromise(chrome.permissions.contains)({ permissions, origins });
			if (hasPermissions) {
				return true;
			}
			await sendMessage('userGesture', tabId);
			return apiToPromise(chrome.permissions.request)({ permissions, origins });
		case 'remove':
			return apiToPromise(chrome.permissions.remove)({ permissions, origins });
	}
});

addListener('storage', ([operation, key, value]) => {
	switch (operation) {
		case 'get':
			return localStorage.getItem(key);
		case 'set':
			return localStorage.setItem(key, value);
		case 'remove':
			return localStorage.removeItem(key);
		case 'has':
			return key in localStorage;
		case 'keys':
			return Object.keys(localStorage);
	}
});

addListener('deleteCookies', cookies =>
	cookies.forEach(({ url, name }) => chrome.cookies.remove({ url, name }))
);

addListener('openNewTabs', ({ urls, focusIndex }, { id: tabId, index: currentIndex }) => {
	urls.forEach((url, i) => chrome.tabs.create({
		url,
		selected: i === focusIndex,
		index: ++currentIndex,
		openerTabId: tabId
	}));
});

addListener('addURLToHistory', url => {
	chrome.history.addUrl({ url });
});

addListener('XHRCache', ({ operation }) => {
	switch (operation) {
		case 'clear':
			XHRCache.clear();
			break;
	}
});

chrome.pageAction.onClicked.addListener(({ id: tabId }) =>
	sendMessage('pageActionClick', tabId)
);

addListener('pageAction', ({ operation, state }, { id: tabId }) => {
	switch (operation) {
		case 'show':
			chrome.pageAction.show(tabId);
			const onOff = state ? 'on' : 'off';
			chrome.pageAction.setIcon({
				tabId,
				path: {
					19: `images/css-${onOff}-small.png`,
					38: `images/css-${onOff}.png`
				}
			});
			break;
		case 'hide':
		case 'destroy':
			chrome.pageAction.hide(tabId);
			break;
	}
});

addListener('multicast', async (request, { id: tabId, incognito }) =>
	Promise.all(
		(await apiToPromise(chrome.tabs.query)({ url: '*://*.reddit.com/*', status: 'complete' }))
			.filter(tab => tab.id !== tabId && tab.incognito === incognito)
			.map(({ id }) => sendMessage('multicast', id, request))
	)
);
