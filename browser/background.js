/* eslint-env webextensions */

// include the LICENSE file
import 'file-loader?name=LICENSE!../LICENSE';

import cssOff from '../images/css-off.png';
import cssOffSmall from '../images/css-off-small.png';
import cssOn from '../images/css-on.png';
import cssOnSmall from '../images/css-on-small.png';
import { getLocaleDictionary } from '../locales';
import Cache from '../lib/utils/Cache';
import { createMessageHandler } from './utils/messaging';
import { apiToPromise } from './utils/api';

const _sendMessage = apiToPromise(chrome.tabs.sendMessage);

const {
	_handleMessage,
	sendMessage,
	addListener,
} = createMessageHandler(({ transaction, isResponse, ...obj }, { sendResponse, tabId }) => {
	if (isResponse) {
		sendResponse(obj);
	} else {
		_sendMessage(tabId, obj).then(obj => {
			_handleMessage({ ...obj, transaction, isResponse: true });
		});
	}
});

chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => _handleMessage(obj, { ...sender.tab, sendResponse }));

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
		status: rawResponse.status,
		text: await rawResponse.text(),
	};
});

const waiting = new Map();
addListener('authFlow', ({ operation, id, token }) => {
	switch (operation) {
		case 'start':
			if (waiting.has(id)) {
				throw new Error(`Auth handler for id: ${id} already exists.`);
			}
			return new Promise((resolve, reject) => waiting.set(id, { resolve, reject }));
		case 'complete': {
			const handler = waiting.get(id);
			if (!handler) {
				console.error(`No auth handler for id: ${id} (sent token: ${token}).`);
				return false;
			}
			waiting.delete(id);
			handler.resolve(token);
			return true;
		}
		case 'cancel': {
			const handler = waiting.get(id);
			if (!handler) {
				console.error(`No auth handler for id: ${id} (attempted cancellation).`);
				return false;
			}
			waiting.delete(id);
			handler.reject(new Error('Auth flow cancelled.'));
			return true;
		}
		default:
			throw new Error(`Invalid authFlow operation: ${operation}`);
	}
});

addListener('i18n', locale => getLocaleDictionary(locale));

// Chakra bug https://github.com/Microsoft/ChakraCore/issues/2606
// eslint-disable-next-line arrow-body-style
addListener('multicast', async (request, { id: tabId, incognito }) => {
	return Promise.all(
		(await apiToPromise(chrome.tabs.query)({ url: '*://*.reddit.com/*', status: 'complete' }))
			.filter(tab => tab.id !== tabId && tab.incognito === incognito)
			.map(({ id: tabId }) => sendMessage('multicast', request, { tabId }))
	);
});

chrome.pageAction.onClicked.addListener(({ id: tabId }) => {
	sendMessage('pageActionClick', undefined, { tabId });
});

addListener('pageAction', ({ operation, state }, { id: tabId }) => {
	switch (operation) {
		case 'show':
			chrome.pageAction.show(tabId);
			chrome.pageAction.setIcon({
				tabId,
				path: {
					19: state ? cssOnSmall : cssOffSmall,
					38: state ? cssOn : cssOff,
				},
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
