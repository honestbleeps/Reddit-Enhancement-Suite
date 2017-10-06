/* @flow */

/* eslint-env webextensions */
/* eslint-disable quote-props */

// include the LICENSE file
// $FlowIgnore
import 'file-loader?name=LICENSE!../LICENSE';

import _ from 'lodash';
import cssOff from '../images/css-off.png';
import cssOffSmall from '../images/css-off-small.png';
import cssOn from '../images/css-on.png';
import cssOnSmall from '../images/css-on-small.png';
import { getLocaleDictionary } from '../locales';
import { Cache } from '../lib/utils/Cache';
import { keyedMutex } from '../lib/utils/async';
import { createMessageHandler } from './utils/messaging';
import { apiToPromise } from './utils/api';

const _sendMessage = apiToPromise(chrome.tabs.sendMessage);

const {
	_handleMessage,
	sendMessage,
	addListener,
} = createMessageHandler((obj, tabId) => _sendMessage(tabId, obj));

chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => _handleMessage(obj, sendResponse, sender.tab));

export {
	sendMessage,
	addListener,
};

addListener('ajax', async ({ method, url, headers, data }) => {
	const rawResponse = await fetch(url, {
		method,
		headers,
		credentials: 'omit', // never send credentials cross-origin
		body: data,
	});

	return {
		ok: rawResponse.ok,
		status: rawResponse.status,
		headers: _.fromPairs(Array.from(rawResponse.headers.entries())),
		text: await rawResponse.text(),
	};
});

addListener('i18n', locale => getLocaleDictionary(locale));

addListener('multicast', async ({ name, args, crossIncognito }, { id: tabId, incognito }) =>
	Promise.all(
		(await apiToPromise(chrome.tabs.query)({ url: '*://*.reddit.com/*', status: 'complete' }))
			.filter(tab => tab.id !== tabId && (crossIncognito || tab.incognito === incognito))
			.map(({ id: tabId }) => sendMessage('multicast', { name, args }, tabId))
	)
);

chrome.pageAction.onClicked.addListener(({ id: tabId }) => {
	sendMessage('pageActionClick', undefined, tabId);
});

addListener('pageAction', ({ operation, state }, { id: tabId }) => {
	switch (operation) {
		case 'show':
			chrome.pageAction.show(tabId);
			chrome.pageAction.setIcon({
				tabId,
				path: {
					'19': state ? cssOnSmall : cssOffSmall,
					'38': state ? cssOn : cssOff,
				},
			});
			chrome.pageAction.setTitle({
				tabId,
				title: state ? 'Subreddit Style On' : 'Subreddit Style Off',
			});
			break;
		case 'hide':
			chrome.pageAction.hide(tabId);
			break;
		default:
			throw new Error(`Invalid pageAction operation: ${operation}`);
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
		case 'has':
			return session.has(key);
		case 'clear':
			return session.clear();
		default:
			throw new Error(`Invalid session operation: ${operation}`);
	}
});

addListener('storage-cas', keyedMutex(async ([key, oldValue, newValue]) => {
	const storedValue = (await apiToPromise(chrome.storage.local.get)(key))[key];
	if (storedValue !== oldValue) return false;
	await apiToPromise(chrome.storage.local.set)({ [key]: newValue });
	return true;
}, ([key]) => key));

const cache = new Cache();
addListener('XHRCache', ([operation, key, value]) => {
	switch (operation) {
		case 'set':
			return cache.set(key, value);
		case 'check':
			return cache.get(key, value);
		case 'delete':
			return cache.delete(key);
		case 'clear':
			return cache.clear();
		default:
			throw new Error(`Invalid XHRCache operation: ${operation}`);
	}
});
