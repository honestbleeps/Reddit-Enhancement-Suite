/* global safari: false */

import 'babel-polyfill';

import Cache from '../lib/utils/Cache';

import { createMessageHandler } from '../lib/environment/_helpers';

const {
	_handleMessage,
	sendMessage,
	addListener
} = createMessageHandler((type, obj, page) => page.dispatchMessage(type, obj));

safari.application.addEventListener('message', ({ name: type, message: obj, target: tab }) => {
	_handleMessage(type, obj, tab.page);
});

// Listeners

addListener('ajax', async ({ method, url, headers, data, credentials }) => {
	const request = new XMLHttpRequest();

	const load = Promise.race([
		new Promise(resolve => (request.onload = resolve)),
		new Promise(resolve => (request.onerror = resolve))
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
		status: request.status,
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
				console.warn('Failed to parse:', key, 'falling back to raw string.');
			}
			return localStorage.getItem(key);
		case 'set':
			return localStorage.setItem(key, JSON.stringify(value));
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
		case 'clear':
			return localStorage.clear();
		default:
			throw new Error(`Invalid storage operation: ${operation}`);
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
		default:
			throw new Error(`Invalid session operation: ${operation}`);
	}
});

addListener('openNewTabs', ({ urls, focusIndex }, tab) => {
	// Really? No SafariBrowserTab::index?
	let currentIndex = Array.from(tab.browserWindow.tabs).findIndex(t => t === tab);
	if (currentIndex === -1) currentIndex = 2 ** 50; // 7881299347898367 more tabs may be safely opened
	urls.forEach((url, i) => (
		tab.browserWindow.openTab(
			i === focusIndex ? 'foreground' : 'background',
			++currentIndex
		).url = url
	));
});

const cache = new Cache();

addListener('XHRCache', ({ operation, key, value, maxAge }) => {
	switch (operation) {
		case 'set':
			return cache.set(key, value);
		case 'check':
			return cache.check(key, maxAge);
		case 'delete':
			return cache.delete(key);
		case 'clear':
			return cache.clear();
		default:
			throw new Error(`Invalid XHRCache operation: ${operation}`);
	}
});

addListener('isPrivateBrowsing', (request, tab) => tab.private);

addListener('multicast', async (request, senderTab) =>
	Promise.all(
		Array.from(safari.application.browserWindows)
			.map(w => Array.from(w.tabs))
			.reduce((acc, tabs) => acc.concat(tabs), [])
			.filter(tab => tab !== senderTab && tab.private === senderTab.private && tab.page)
			.map(({ page }) => sendMessage('multicast', request, page))
	)
);
