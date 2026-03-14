/* @flow */

import { createMessageHandler } from '../utils/messaging';
import { apiToPromise } from '../utils/api';
import { isSafari } from '../utils/capabilities';

const callbackSendMessage = apiToPromise(chrome.tabs.sendMessage);

function sendTabMessage(tabId, obj) {
	if (!isSafari) return callbackSendMessage(tabId, obj);

	if (typeof browser === 'object' && browser.tabs && typeof browser.tabs.sendMessage === 'function') {
		return browser.tabs.sendMessage(tabId, obj);
	}

	const result = chrome.tabs.sendMessage(tabId, obj);
	if (result && typeof result.then === 'function') return result;

	return Promise.reject(new Error('Safari tabs.sendMessage did not return a Promise.'));
}

const {
	_handleMessage,
	sendMessage,
	addListener,
} = createMessageHandler((obj, tabId) => sendTabMessage(tabId, obj));

chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => _handleMessage(obj, sendResponse, sender));

export {
	sendMessage,
	addListener,
};
