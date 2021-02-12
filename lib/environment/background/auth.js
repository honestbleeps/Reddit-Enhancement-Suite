/* @flow */
import { apiToPromise } from '../utils/api';
import { addListener } from './messaging';

addListener('authFlow', ({ domain, clientId, scope, interactive }) => {
	const redirectUri = process.env.BUILD_TARGET !== 'firefox' ? 'https://redditenhancementsuite.com/oauth' : chrome.identity.getRedirectURL();
	const url = new URL(domain);
	url.searchParams.set('client_id', clientId);
	url.searchParams.set('scope', scope);
	url.searchParams.set('response_type', 'token');
	url.searchParams.set('redirect_uri', redirectUri);

	if (process.env.BUILD_TARGET !== 'firefox') {
		// Chrome supports chrome.identity.launchAuthFlow.
		// However--and quite inexplicably--the auth process is performed in a separate context whose cookies
		// are cleared whenever the browser is restarted, making noninteractive auth pretty much useless.
		// Instead, fully emulate the flow in the main context, where users will remain logged in when
		// they expect to be, i.e., as long as they're logged into the main site.
		// As a bonus, we can use redditenhancementsuite.com as the redirect instead of chromiumapp.org.
		if (interactive) {
			return emulateAuthFlowInNewWindow(url.href, redirectUri);
		} else {
			return emulateAuthFlowInBackground(url.href);
		}
	} else if (process.env.BUILD_TARGET === 'firefox') {
		// Firefox correctly supports chrome.identity.launchAuthFlow.
		return apiToPromise(chrome.identity.launchWebAuthFlow)({ url: url.href, interactive });
	}
});

async function emulateAuthFlowInNewWindow(url: string, redirectUri: string): Promise<string> {
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

function emulateAuthFlowInBackground(url: string): Promise<string> {
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
