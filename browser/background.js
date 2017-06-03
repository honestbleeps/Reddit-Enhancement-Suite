/* @flow */

/* eslint-env webextensions */
/* eslint-disable quote-props */

// include the LICENSE file
// $FlowIgnore
import 'file-loader?name=LICENSE!../LICENSE';

import cssOff from '../images/css-off.png';
import cssOffSmall from '../images/css-off-small.png';
import cssOn from '../images/css-on.png';
import cssOnSmall from '../images/css-on-small.png';
import { getLocaleDictionary } from '../locales';
import Cache from '../lib/utils/Cache';
import { createMessageHandler } from './utils/messaging';
import { apiToPromise } from './utils/api';

const _sendMessage = apiToPromise(chrome.tabs.sendMessage);

const {
	_handleMessage,
	sendMessage,
	addListener,
} = createMessageHandler((obj, tabId) => _sendMessage(tabId, obj));

chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => _handleMessage(obj, sendResponse, sender.tab));

export {
	sendMessage,
	addListener,
};

addListener('ajax', async ({ method, url, headers, data }) => {
	const rawResponse = await fetch(url, {
		method,
		headers,
		credentials: 'omit', // never send credentials cross-origin
		body: data,
	});

	return {
		status: rawResponse.status,
		text: await rawResponse.text(),
	};
});

addListener('authFlow', async ({ domain, clientId, scope, interactive }) => {
	const url = new URL(domain);
	url.searchParams.set('client_id', clientId);
	url.searchParams.set('scope', scope);
	url.searchParams.set('response_type', 'token');

	let responseUrl;

	if (!interactive) {
		// Try to get an auth token non-interactively using the native API.
		// The browser will throw an error if it cannot complete without user input.
		url.searchParams.set('redirect_uri', chrome.identity.getRedirectURL());
		// chrome.identity is not implemented in Edge, so this throws.
		// That's okay, because noninteractive auth is expected to fail sometimes.
		responseUrl = await apiToPromise(chrome.identity.launchWebAuthFlow)({ url: url.href, interactive: false });
	} else {
		// Try to get an auth token interactively.
		// We do not use the native API, because it requires a redirect to a potentially
		// confusing domain, like chromiumapp.org or allizom.org.
		// Instead, open a tab which will redirect to the sensible domain redditenhancementsuite.com
		// and track it with the chrome.tabs API.
		const redirectUri = 'https://redditenhancementsuite.com/oauth';
		url.searchParams.set('redirect_uri', redirectUri);

		const { tabs: [{ id }] } = await apiToPromise(chrome.windows.create)({ url: url.href, type: 'popup' });

		responseUrl = await new Promise((resolve, reject) => {
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
	}

	const hash = new URL(responseUrl).hash.slice(1);
	const token = new URLSearchParams(hash).get('access_token');

	if (!token) throw new Error('No token found in response.');

	return token;
});

addListener('i18n', locale => getLocaleDictionary(locale));

// Chakra bug https://github.com/Microsoft/ChakraCore/issues/2606
// eslint-disable-next-line arrow-body-style
addListener('multicast', async (request, { id: tabId, incognito }) => {
	return Promise.all(
		(await apiToPromise(chrome.tabs.query)({ url: '*://*.reddit.com/*', status: 'complete' }))
			.filter(tab => tab.id !== tabId && tab.incognito === incognito)
			.map(({ id: tabId }) => sendMessage('multicast', request, tabId))
	);
});

chrome.pageAction.onClicked.addListener(({ id: tabId }) => {
	sendMessage('pageActionClick', undefined, tabId);
});

addListener('pageAction', ({ operation, state }, { id: tabId }) => {
	switch (operation) {
		case 'show':
			chrome.pageAction.show(tabId);
			chrome.pageAction.setIcon({
				tabId,
				path: {
					'19': state ? cssOnSmall : cssOffSmall,
					'38': state ? cssOn : cssOff,
				},
			});
			chrome.pageAction.setTitle({
				tabId,
				title: state ? 'Subreddit Style On' : 'Subreddit Style Off',
			});
			break;
		case 'hide':
			chrome.pageAction.hide(tabId);
			break;
		default:
			throw new Error(`Invalid pageAction operation: ${operation}`);
	}
});

const session = new Map();
addListener('session', ([operation, key, value]) => {
	switch (operation) {
		case 'get':
			return session.get(key);
		case 'set':
			session.set(key, value);
			break;
		case 'delete':
			return session.delete(key);
		case 'has':
			return session.has(key);
		case 'clear':
			return session.clear();
		default:
			throw new Error(`Invalid session operation: ${operation}`);
	}
});

const cache = new Cache();
addListener('XHRCache', ([operation, key, value]) => {
	switch (operation) {
		case 'set':
			return cache.set(key, value);
		case 'check':
			return cache.get(key, value);
		case 'delete':
			return cache.delete(key);
		case 'clear':
			return cache.clear();
		default:
			throw new Error(`Invalid XHRCache operation: ${operation}`);
	}
});
