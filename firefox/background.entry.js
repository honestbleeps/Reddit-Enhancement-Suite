/* eslint-env webextensions */

import { addListener } from '../browser/background';
import { apiToPromise } from '../browser/utils/api';

addListener('addURLToHistory', url => {
	chrome.history.addUrl({ url });
});

addListener('isURLVisited', async url =>
	(await apiToPromise(chrome.history.getVisits)({ url })).length > 0
);

// Firefox <a download> is same-origin only
addListener('download', ({ url, filename }) => {
	chrome.downloads.download({ url, filename });
});

// Firefox doesn't support openerTabId
addListener('openNewTabs', ({ urls, focusIndex }, { index: currentIndex }) => {
	urls.forEach((url, i) => {
		chrome.tabs.create({
			url,
			active: i === focusIndex,
			index: ++currentIndex,
		});
	});
});

// Firefox doesn't have permissions.*
addListener('permissions', () => true);
