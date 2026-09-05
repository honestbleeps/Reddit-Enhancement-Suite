/* @flow */

import { createMessageHandler } from '../utils/messaging';
import { apiToPromise } from '../utils/api';
import { isSafari } from '../utils/capabilities';
import { sendRuntimeMessageForBrowser } from '../utils/messageTransport';

const callbackSendMessage = apiToPromise(chrome.runtime.sendMessage);

function sendRuntimeMessage(obj) {
	return sendRuntimeMessageForBrowser(obj, {
		isSafari,
		callbackSendMessage,
		browserRuntime: typeof browser === 'object' ? browser.runtime : null,
		chromeRuntimeSendMessage: payload => chrome.runtime.sendMessage(payload),
	});
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
