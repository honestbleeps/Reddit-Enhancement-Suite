/* @flow */

import { createMessageHandler } from '../utils/messaging';
import { apiToPromise } from '../utils/api';

const _sendMessage = (() => {
	if (typeof chrome === "undefined") {
		return (...args) => {
			console.log("sendMessage", args);
			return new Promise((resolve, reject) => reject("not implemented"));
		};
	}
	return apiToPromise(chrome.runtime.sendMessage);
})();

const {
	_handleMessage,
	sendMessage,
	addListener,
} = createMessageHandler(obj => _sendMessage(obj));

if (typeof chrome !== "undefined") {
	chrome.runtime.onMessage.addListener((obj, sender, sendResponse) =>
		_handleMessage(obj, sendResponse));
}

export {
	sendMessage,
	addListener,
};
