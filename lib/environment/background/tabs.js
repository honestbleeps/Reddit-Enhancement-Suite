/* @flow */

import { addListener } from './messaging';

addListener('openNewTabs', ({ urls, focusIndex }, { id: tabId, index: currentIndex, cookieStoreId }) => {
	if (process.env.BUILD_TARGET === 'chrome') {
		urls.forEach((url, i) => {
			chrome.tabs.create({
				url,
				active: i === focusIndex,
				index: ++currentIndex,
				openerTabId: tabId,
			});
		});
	} else if (process.env.BUILD_TARGET === 'firefox') {
		// Firefox needs cookieStoreId to open in correct container
		urls.forEach((url, i) => {
			chrome.tabs.create({
				url,
				active: i === focusIndex,
				openerTabId: tabId,
				cookieStoreId,
			});
		});
	} else if (process.env.BUILD_TARGET === 'edge') {
		// Edge doesn't support openerTabId
		urls.forEach((url, i) => {
			chrome.tabs.create({
				url,
				active: i === focusIndex,
				index: ++currentIndex,
			});
		});
	}
});

