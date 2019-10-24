/* @flow */

import { addListener } from './messaging';

addListener('openNewTabs', ({ urls, focusIndex }, { tab }) => {
	urls.forEach((url, i) => {
		chrome.tabs.create({
			url,
			active: i === focusIndex,
			index: tab.index + 1 + i,
			openerTabId: tab.id,
			// Firefox needs cookieStoreId to open in correct container
			...(process.env.BUILD_TARGET === 'firefox' ? { cookieStoreId: tab.cookieStoreId } : {}),
		});
	});
});

