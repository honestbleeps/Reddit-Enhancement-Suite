/*

	RES is released under the GPL. However, I do ask a favor (obviously I don't/can't require it, I ask out of courtesy):

	Because RES auto updates and is hosted from a central server, I humbly request that if you intend to distribute your own
	modified Reddit Enhancement Suite, you name it something else and make it very clear to your users that it's your own
	branch and isn't related to mine.

	RES is updated very frequently, and I get lots of tech support questions/requests from people on outdated versions. If
	you're distributing RES via your own means, those recipients won't always be on the latest and greatest, which makes
	it harder for me to debug things and understand (at least with browsers that auto-update) whether or not people are on
	a current version of RES.

	I can't legally hold you to any of this - I'm just asking out of courtesy.

	Thanks, I appreciate your consideration.  Without further ado, the all-important GPL Statement:

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

/* eslint-env webextensions */

import { addCommonBackgroundListeners } from '../lib/environment/_common';
import { createMessageHandler } from '../lib/environment/_messaging';

import cssOff from '../images/css-off.png';
import cssOffSmall from '../images/css-off-small.png';
import cssOn from '../images/css-on.png';
import cssOnSmall from '../images/css-on-small.png';

import { apiToPromise } from './_helpers';

const _sendMessage = apiToPromise(chrome.tabs.sendMessage);

const {
	_handleMessage,
	sendMessage,
	addListener,
} = createMessageHandler((type, { transaction, isResponse, ...obj }, { sendResponse, tabId }) => {
	if (isResponse) {
		sendResponse(obj);
	} else {
		_sendMessage(tabId, { ...obj, type }).then(obj => {
			_handleMessage(type, { ...obj, transaction, isResponse: true });
		});
	}
});

chrome.runtime.onMessage.addListener(({ type, ...obj }, sender, sendResponse) => _handleMessage(type, obj, { ...sender.tab, sendResponse }));

// Listeners

addCommonBackgroundListeners(addListener);

addListener('ajax', async ({ method, url, headers, data, credentials }) => {
	const request = new XMLHttpRequest();

	const load = Promise.race([
		new Promise(resolve => (request.onload = resolve)),
		new Promise(resolve => (request.onerror = resolve))
			.then(() => { throw new Error(`XHR error - url: ${url}`); }),
	]);

	request.open(method, url, true);

	for (const name in headers) {
		request.setRequestHeader(name, headers[name]);
	}

	if (credentials) {
		request.withCredentials = true;
	}

	request.send(data);

	await load;

	// Only store `status`, `responseText` and `responseURL` fields
	return {
		status: request.status,
		responseText: request.responseText,
		responseURL: request.responseURL,
	};
});

addListener('permissions', async ({ operation, permissions, origins }, { id: tabId }) => {
	switch (operation) {
		case 'request':
			const hasPermissions = await apiToPromise(chrome.permissions.contains)({ permissions, origins });
			if (hasPermissions) {
				return true;
			}
			await sendMessage('userGesture', undefined, { tabId });
			return apiToPromise(chrome.permissions.request)({ permissions, origins });
		case 'remove':
			return apiToPromise(chrome.permissions.remove)({ permissions, origins });
		default:
			throw new Error(`Invalid permissions operation: ${operation}`);
	}
});

(async () => {
	const _set = apiToPromise(::chrome.storage.local.set);
	const set = (key, value) => _set({ [key]: value });

	const MIGRATED_TO_CHROME_STORAGE = 'MIGRATED_TO_CHROME_STORAGE';

	if (localStorage.getItem(MIGRATED_TO_CHROME_STORAGE) !== MIGRATED_TO_CHROME_STORAGE) {
		await Promise.all(Object.keys(localStorage).map(async key => {
			try {
				await set(key, JSON.parse(localStorage.getItem(key)));
				console.log(key);
			} catch (e) {
				await set(key, localStorage.getItem(key));
				console.warn(key);
			}
		}));
		localStorage.setItem(MIGRATED_TO_CHROME_STORAGE, MIGRATED_TO_CHROME_STORAGE);
	}
})();

addListener('deleteCookies', cookies =>
	cookies.forEach(({ url, name }) => chrome.cookies.remove({ url, name }))
);

addListener('openNewTabs', ({ urls, focusIndex }, { id: tabId, index: currentIndex }) => {
	urls.forEach((url, i) => chrome.tabs.create({
		url,
		selected: i === focusIndex,
		index: ++currentIndex,
		openerTabId: tabId,
	}));
});

addListener('addURLToHistory', url => {
	chrome.history.addUrl({ url });
});

addListener('isURLVisited', async url =>
	(await apiToPromise(chrome.history.getVisits)({ url })).length > 0
);

chrome.pageAction.onClicked.addListener(({ id: tabId }) =>
	sendMessage('pageActionClick', undefined, { tabId })
);

addListener('pageAction', ({ operation, state }, { id: tabId }) => {
	switch (operation) {
		case 'show':
			chrome.pageAction.show(tabId);
			chrome.pageAction.setIcon({
				tabId,
				path: {
					19: state ? cssOnSmall : cssOffSmall,
					38: state ? cssOn : cssOff,
				},
			});
			break;
		case 'hide':
		case 'destroy':
			chrome.pageAction.hide(tabId);
			break;
		default:
			throw new Error(`Invalid pageAction operation: ${operation}`);
	}
});

addListener('multicast', async (request, { id: tabId, incognito }) =>
	Promise.all(
		(await apiToPromise(chrome.tabs.query)({ url: '*://*.reddit.com/*', status: 'complete' }))
			.filter(tab => tab.id !== tabId && tab.incognito === incognito)
			.map(({ id: tabId }) => sendMessage('multicast', request, { tabId }))
	)
);
