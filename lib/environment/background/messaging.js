/* @flow */

import { createMessageHandler } from '../utils/messaging';
import { apiToPromise } from '../utils/api';
import { isSafari } from '../utils/capabilities';
import { sendTabMessageForBrowser } from '../utils/messageTransport';

const callbackSendMessage = apiToPromise(chrome.tabs.sendMessage);

function sendTabMessage(tabId, obj) {
	return sendTabMessageForBrowser(tabId, obj, {
		isSafari,
		callbackSendMessage,
		browserTabs: typeof browser === 'object' ? browser.tabs : null,
		chromeTabsSendMessage: (nextTabId, payload) => chrome.tabs.sendMessage(nextTabId, payload),
	});
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
