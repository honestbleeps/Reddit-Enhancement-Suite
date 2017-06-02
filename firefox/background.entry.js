/* @flow */

/* eslint-env webextensions */

import { addListener } from '../browser/background';
import { apiToPromise } from '../browser/utils/api';

addListener('addURLToHistory', url => {
	chrome.history.addUrl({ url });
});

addListener('authFlow', async ({ domain, clientId, scope, interactive }) => {
	const url = new URL(domain);
	url.searchParams.set('client_id', clientId);
	url.searchParams.set('scope', scope);
	url.searchParams.set('redirect_uri', chrome.identity.getRedirectURL());
	url.searchParams.set('response_type', 'token');

	const responseUrl = await apiToPromise(chrome.identity.launchWebAuthFlow)({ interactive, url: url.href });

	const hash = new URL(responseUrl).hash.slice(1);

	return new URLSearchParams(hash).get('access_token');
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
