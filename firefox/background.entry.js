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
addListener('download', ({ url, filename }, { incognito }) => {
	chrome.downloads.download({ url, filename, incognito });
});

// Firefox needs cookieStoreId to open in correct container
addListener('openNewTabs', ({ urls, focusIndex }, { id: tabId, cookieStoreId }) => {
	urls.forEach((url, i) => {
		chrome.tabs.create({
			url,
			active: i === focusIndex,
			openerTabId: tabId,
			cookieStoreId,
		});
	});
});

// Firefox doesn't have permissions.*
addListener('permissions', () => true);
