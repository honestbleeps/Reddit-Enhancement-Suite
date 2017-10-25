/* @flow */

/* eslint-env webextensions */

import { addListener } from '../browser/background';
import { apiToPromise } from '../browser/utils/api';

addListener('addURLToHistory', url => {
	chrome.history.addUrl({ url });
});

addListener('authFlow', ({ domain, clientId, scope, interactive }) => {
	const url = new URL(domain);
	url.searchParams.set('client_id', clientId);
	url.searchParams.set('scope', scope);
	url.searchParams.set('response_type', 'token');
	url.searchParams.set('redirect_uri', 'https://redditenhancementsuite.com/oauth');

	return apiToPromise(chrome.identity.launchWebAuthFlow)({ url: url.href, interactive });
});

addListener('isURLVisited', async url =>
	(await apiToPromise(chrome.history.getVisits)({ url })).length > 0
);

// Firefox <a download> is same-origin only
addListener('download', ({ url, filename }) => {
	chrome.downloads.download({ url, filename });
});

// Firefox doesn't support openerTabId, and needs cookieStoreId to open in correct container
addListener('openNewTabs', ({ urls, focusIndex }, { index: currentIndex, cookieStoreId }) => {
	urls.forEach((url, i) => {
		chrome.tabs.create({
			url,
			active: i === focusIndex,
			index: ++currentIndex,
			cookieStoreId,
		});
	});
});

// Firefox doesn't have permissions.*
addListener('permissions', () => true);
