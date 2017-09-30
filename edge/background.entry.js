/* @flow */

/* eslint-env webextensions */

import { addListener } from '../browser/background';
import { emulateAuthFlowInNewWindow, emulateAuthFlowInNewTab } from '../browser/utils/auth';

// Edge doesn't have history.*
addListener('addURLToHistory', () => {});
addListener('isURLVisited', () => false);

addListener('authFlow', ({ domain, clientId, scope, loginHint, interactive }, { index: currentIndex }) => {
	// Edge does not support chrome.identity.launchAuthFlow.
	// Its chrome.webRequest API does not support requests made by extensions,
	// so we can't emulate noninteractive auth without a new tab.
	const redirectUri = 'https://redditenhancementsuite.com/oauth';
	const url = new URL(domain);
	url.searchParams.set('client_id', clientId);
	url.searchParams.set('scope', scope);
	if (loginHint) {
		url.searchParams.set('login_hint', loginHint);
	}
	url.searchParams.set('response_type', 'token');
	url.searchParams.set('redirect_uri', redirectUri);

	if (interactive) {
		return emulateAuthFlowInNewWindow(url.href, redirectUri);
	} else {
		return emulateAuthFlowInNewTab(url.href, redirectUri, currentIndex);
	}
});

// see chrome/background.entry.js
addListener('download', ({ url, filename }) => {
	const a = document.createElement('a');
	a.href = url;
	a.download = filename || '';
	a.click();
});

// Edge doesn't support openerTabId
addListener('openNewTabs', ({ urls, focusIndex }, { index: currentIndex }) => {
	urls.forEach((url, i) => {
		chrome.tabs.create({
			url,
			active: i === focusIndex,
			index: ++currentIndex,
		});
	});
});

// Edge doesn't have permissions.*
addListener('permissions', () => true);
