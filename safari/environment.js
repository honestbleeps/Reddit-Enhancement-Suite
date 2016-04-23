// allow the reexports to be overridden
/* eslint-disable import/export */
/* global safari */

import 'babel-polyfill';

import resCss from '../lib/css/res.scss';

import { Init } from '../lib/core';
import { createMessageHandler } from '../lib/environment/_helpers';

// Safari has a ridiculous bug that causes it to lose access to safari.self.tab if you click the back button.
// this stupid one liner fixes that.
window.onunload = () => {};

// since safari's built in extension stylesheets are treated as user stylesheets,
// we can't inject them that way.  That makes them "user stylesheets" which would make
// them require !important everywhere - we don't want that, so we'll inject this way instead.
Init.headReady.then(() => {
	const linkTag = document.createElement('link');
	linkTag.rel = 'stylesheet';
	linkTag.href = safari.extension.baseURI + resCss;
	document.head.appendChild(linkTag);
});

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

export * from '../lib/environment';

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
export const PageAction = {
	show: () => Promise.resolve(),
	hide: () => Promise.resolve(),
	destroy: () => Promise.resolve()
};
