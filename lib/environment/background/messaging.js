/* @flow */

import { createMessageHandler } from '../utils/messaging';
import { apiToPromise } from '../utils/api';

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
