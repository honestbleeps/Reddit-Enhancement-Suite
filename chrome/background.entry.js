/* @flow */

/* eslint-env webextensions */

import { addListener } from '../browser/background';
import { apiToPromise } from '../browser/utils/api';
import { emulateAuthFlowInNewWindow, emulateAuthFlowInBackground } from '../browser/utils/auth';

addListener('addURLToHistory', url => {
	chrome.history.addUrl({ url });
});

addListener('authFlow', ({ domain, clientId, scope, loginHint, interactive }) => {
	// Chrome supports chrome.identity.launchAuthFlow.
	// However--and quite inexplicably--the auth process is performed in a separate context whose cookies
	// are cleared whenever the browser is restarted, making noninteractive auth pretty much useless.
	// Instead, fully emulate the flow in the main context, where users will remain logged in when
	// they expect to be, i.e., as long as they're logged into the main site.
	// As a bonus, we can use redditenhancementsuite.com as the redirect instead of chromiumapp.org.
	const redirectUri = 'https://redditenhancementsuite.com/oauth';
	const url = new URL(domain);
	url.searchParams.set('client_id', clientId);
	url.searchParams.set('scope', scope);
	if (loginHint) {
		url.searchParams.set('login_hint', loginHint);
	}
	url.searchParams.set('response_type', 'token');
	url.searchParams.set('redirect_uri', redirectUri);

	if (interactive) {
		return emulateAuthFlowInNewWindow(url.href, redirectUri);
	} else {
		return emulateAuthFlowInBackground(url.href);
	}
});

addListener('isURLVisited', async url =>
	(await apiToPromise(chrome.history.getVisits)({ url })).length > 0
);

// Adding `download` permission to Chrome would require a permissions dialog,
// and would provide no benefit, since Chrome properly supports <a download>
addListener('download', ({ url, filename }) => {
	const a = document.createElement('a');
	a.href = url;
	a.download = filename || '';
	a.click();
});

addListener('openNewTabs', ({ urls, focusIndex }, { id: tabId, index: currentIndex }) => {
	urls.forEach((url, i) => {
		chrome.tabs.create({
			url,
			active: i === focusIndex,
			index: ++currentIndex,
			openerTabId: tabId,
		});
	});
});

addListener('permissions', ({ operation, permissions, origins }) => {
	switch (operation) {
		case 'contains':
			return apiToPromise(chrome.permissions.contains)({ permissions, origins });
		case 'request':
			return apiToPromise(chrome.permissions.request)({ permissions, origins });
		case 'remove':
			return apiToPromise(chrome.permissions.remove)({ permissions, origins });
		default:
			throw new Error(`Invalid permissions operation: ${operation}`);
	}
});

// Migration
(async () => {
	const _set = apiToPromise((items, callback) => chrome.storage.local.set(items, callback));
	const set = (key, value) => _set({ [key]: value });

	const MIGRATED_TO_CHROME_STORAGE = 'MIGRATED_TO_CHROME_STORAGE';

	if (localStorage.getItem(MIGRATED_TO_CHROME_STORAGE) !== MIGRATED_TO_CHROME_STORAGE) {
		await Promise.all(Object.keys(localStorage).map(async key => {
			try {
				await set(key, JSON.parse((localStorage.getItem(key): any)));
				console.log(key);
			} catch (e) {
				await set(key, localStorage.getItem(key));
				console.warn(key);
			}
		}));
		localStorage.setItem(MIGRATED_TO_CHROME_STORAGE, MIGRATED_TO_CHROME_STORAGE);
	}
})();
