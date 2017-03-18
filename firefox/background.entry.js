/* eslint-env webextensions */

import { addListener } from '../browser/background';
import { apiToPromise } from '../browser/utils/api';

addListener('addURLToHistory', url => {
	chrome.history.addUrl({ url });
});

addListener('isURLVisited', async url =>
	(await apiToPromise(chrome.history.getVisits)({ url })).length > 0
);

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

// Migration
{
	const _set = apiToPromise((items, callback) => chrome.storage.local.set(items, callback));

	console.log('opening port for migration');
	const port = browser.runtime.connect({ name: 'migrate-start' });

	port.onMessage.addListener(async items => {
		console.log('received items for migration', items);
		await _set(items);

		console.log('saved migration items successfully');
		port.postMessage('migrate-success');
	});
}
