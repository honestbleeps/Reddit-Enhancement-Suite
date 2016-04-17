// allow the reexports to be overridden
/* eslint-disable import/export */
/* global safari */

import { createMessageHandler } from '../lib/environment/_helpers';

export * from '../lib/environment';

function _sendMessage(type, obj) {
	safari.self.tab.dispatchMessage(type, obj);
}

const {
	_handleMessage,
	sendMessage,
	addListener
} = createMessageHandler(_sendMessage);

safari.self.addEventListener('message', ({ name: type, message: obj }) => {
	_handleMessage(type, obj);
});

export {
	sendMessage as _sendMessage,
	addListener as _addListener
};

export function deleteCookies(...cookieNames) {
	for (const cookieName of cookieNames) {
		document.cookie = `${cookieName}=null;expires=${Date.now()}; path=/;domain=reddit.com`;
	}
	return Promise.resolve();
}

// The iframe hack doesn't work anymore, so Safari has no way to add urls to history
export function addURLToHistory() {
	return Promise.resolve();
}

// Safari has no pageAction
export const pageAction = {
	show: () => Promise.resolve(),
	hide: () => Promise.resolve(),
	destroy: () => Promise.resolve()
};
