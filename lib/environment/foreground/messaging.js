/* @flow */

import { createMessageHandler } from '../utils/messaging';
import { apiToPromise } from '../utils/api';
import { isSafari } from '../utils/capabilities';

const callbackSendMessage = apiToPromise(chrome.runtime.sendMessage);

function sendRuntimeMessage(obj) {
	if (!isSafari) return callbackSendMessage(obj);

	if (typeof browser === 'object' && browser.runtime && typeof browser.runtime.sendMessage === 'function') {
		return browser.runtime.sendMessage(obj);
	}

	const result = chrome.runtime.sendMessage(obj);
	if (result && typeof result.then === 'function') return result;

	return Promise.reject(new Error('Safari runtime.sendMessage did not return a Promise.'));
}

const {
	_handleMessage,
	sendMessage,
	addListener,
} = createMessageHandler(obj => sendRuntimeMessage(obj));

chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => _handleMessage(obj, sendResponse));

export {
	sendMessage,
	addListener,
};
