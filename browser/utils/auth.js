/* @flow */
/* eslint-env webextensions */

import { apiToPromise } from './api';

export async function emulateAuthFlowInNewWindow(url: string, redirectUri: string): Promise<string> {
	// Emulate interactive auth.
	// Open a popup window, then track its progress with chrome.tabs,
	// succeeding if it navigates to our redirect URL, and failing if it's
	// closed before then.
	const { tabs: [{ id }] } = await apiToPromise(chrome.windows.create)({ url, type: 'popup' });

	return new Promise((resolve, reject) => {
		function updateListener(tabId, updates) {
			if (tabId !== id) return;

			if (updates.url && updates.url.startsWith(redirectUri)) {
				stopListening();
				resolve(updates.url);
				apiToPromise(chrome.tabs.remove)(id);
			}
		}

		function removeListener(tabId) {
			if (tabId !== id) return;
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

export function emulateAuthFlowInBackground(url: string): Promise<string> {
	// Emulate noninteractive auth.
	// Fetch the auth page. If the user is preauthorized, we will 302
	// to the redirect URL. However, because the token is passed in the hash,
	// and fetch/XHR responses don't include the hash, we must use the
	// webRequest API to read the redirect URL.
	return new Promise((resolve, reject) => {
		function headersListener({ redirectUrl }) {
			stopListening();
			resolve(redirectUrl);
		}

		function stopListening() {
			chrome.webRequest.onBeforeRedirect.removeListener(headersListener);
		}

		chrome.webRequest.onBeforeRedirect.addListener(headersListener, { urls: [url] });

		fetch(url, { credentials: 'include' })
			.then(() => {
				stopListening();
				reject(new Error('User interaction is required.'));
			}, e => {
				stopListening();
				reject(new Error(`Authorization page could not be loaded: ${e.message}`));
				console.error(e);
			});
	});
}

export async function emulateAuthFlowInNewTab(url: string, redirectUri: string, currentTabIndex: number): Promise<string> {
	// Emulate noninteractive auth.
	// Open a background tab and track its progress with chrome.tabs,
	// succeeding if it navigates to the redirect URL immediately.
	const { id } = await apiToPromise(chrome.tabs.create)({ url, index: currentTabIndex + 1, active: false });

	return new Promise((resolve, reject) => {
		function updateListener(tabId, updates) {
			if (tabId !== id) return;

			if (updates.url && updates.url.startsWith(redirectUri)) {
				stopListening();
				resolve(updates.url);
				apiToPromise(chrome.tabs.remove)(id);
			} else if (updates.status && updates.status === 'complete') {
				// the page has loaded but we haven't redirected
				stopListening();
				reject(new Error('User interaction is required.'));
				apiToPromise(chrome.tabs.remove)(id);
			}
		}

		function removeListener(tabId) {
			if (tabId !== id) return;
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
