/* @flow */

/* eslint-env webextensions */

import { addListener } from '../browser/background';
import { emulateAuthFlow } from '../browser/utils/auth';

// Edge doesn't have history.*
addListener('addURLToHistory', () => {});
addListener('isURLVisited', () => false);

addListener('authFlow', ({ domain, clientId, scope, interactive }, { index }) =>
	emulateAuthFlow({ domain, clientId, scope, interactive, currentTabIndex: index })
);

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
