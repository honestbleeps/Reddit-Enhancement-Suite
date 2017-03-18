/* eslint-env webextensions */

import { addListener } from '../browser/background';

// Edge doesn't have history.*
addListener('addURLToHistory', () => {});
addListener('isURLVisited', () => false);

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
