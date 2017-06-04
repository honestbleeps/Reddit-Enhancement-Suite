/* @flow */

/* eslint-env webextensions */

import { addListener } from '../browser/background';
import { apiToPromise } from '../browser/utils/api';

// Edge doesn't have history.*
addListener('addURLToHistory', () => {});
addListener('isURLVisited', () => false);

addListener('authFlow', async ({ domain, clientId, scope, interactive }) => {
	if (!interactive) {
		throw new Error('Edge does not support noninteractive auth.');
	}

	const redirectUri = 'https://redditenhancementsuite.com/oauth';
	const url = new URL(domain);
	url.searchParams.set('client_id', clientId);
	url.searchParams.set('scope', scope);
	url.searchParams.set('response_type', 'token');
	url.searchParams.set('redirect_uri', redirectUri);

	const { tabs: [{ id }] } = await apiToPromise(chrome.windows.create)({ url: url.href, type: 'popup' });

	return new Promise((resolve, reject) => {
		function updateListener(tabId, { url }) {
			if (tabId === id && url && url.startsWith(redirectUri)) {
				stopListening();
				// Redirect arrived at the target, send back the URL...
				resolve(url);
				// ...and close the tab, since we have no forground script running on it.
				// It's not feasible to use a foreground script to close the tab anyways,
				// since Edge blocks it with a ridiculous
				// "The site you're on is trying to close this window" warning.
				apiToPromise(chrome.tabs.remove)(id);
			}
		}

		function removeListener(tabId) {
			if (tabId === id) {
				stopListening();
				reject(new Error('User cancelled or denied access.'));
			}
		}

		function stopListening() {
			chrome.tabs.onUpdated.removeListener(updateListener);
			chrome.tabs.onRemoved.removeListener(removeListener);
		}

		chrome.tabs.onUpdated.addListener(updateListener);
		chrome.tabs.onRemoved.addListener(removeListener);
	});
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
