/* @flow */
/* eslint-env webextensions */

import { apiToPromise } from './api';

export async function emulateAuthFlow({
	domain,
	clientId,
	scope,
	interactive,
	currentTabIndex,
}: {|
	domain: string,
	clientId: string,
	scope: string,
	interactive: boolean,
	currentTabIndex: number,
|}) {
	const redirectUri = 'https://redditenhancementsuite.com/oauth';
	const url = new URL(domain);
	url.searchParams.set('client_id', clientId);
	url.searchParams.set('scope', scope);
	url.searchParams.set('response_type', 'token');
	url.searchParams.set('redirect_uri', redirectUri);

	let id;
	if (interactive) {
		({ tabs: [{ id }] } = await apiToPromise(chrome.windows.create)({
			url: url.href,
			type: 'popup',
		}));
	} else {
		({ id } = await apiToPromise(chrome.tabs.create)({
			url: url.href,
			index: currentTabIndex + 1,
			active: false,
		}));
	}

	return new Promise((resolve, reject) => {
		function updateListener(tabId, updates) {
			if (tabId !== id) return;

			if (updates.url && updates.url.startsWith(redirectUri)) {
				// we've reached the redirect URL
				stopListening();
				resolve(updates.url);
				apiToPromise(chrome.tabs.remove)(id);
			} else if (!interactive && updates.status && updates.status === 'complete') {
				// the page has loaded but we haven't redirected
				stopListening();
				reject(new Error('User interaction is required.'));
				apiToPromise(chrome.tabs.remove)(id);
			}
		}

		function removeListener(tabId) {
			if (tabId !== id) return;
			// tab closed
			stopListening();
			reject(new Error('User cancelled or denied access.'));
		}

		function stopListening() {
			chrome.tabs.onUpdated.removeListener(updateListener);
			chrome.tabs.onRemoved.removeListener(removeListener);
		}

		chrome.tabs.onUpdated.addListener(updateListener);
		chrome.tabs.onRemoved.addListener(removeListener);
	});
}
