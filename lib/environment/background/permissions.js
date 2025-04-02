/* @flow */

import { apiToPromise } from '../utils/api';
import { addListener } from './messaging';

addListener('permissions', handleMessage);

export function handleMessage({ operation, permissions, origins }: *) {
	switch (operation) {
		case 'contains':
			return apiToPromise(chrome.permissions.contains)({ permissions, origins });
		case 'request':
			return apiToPromise(chrome.permissions.request)({ permissions, origins })
				.catch(() => makePromptWindow({ permissions, origins }));
		default:
			throw new Error(`Invalid permissions operation: ${operation}`);
	}
}

async function isFirefox() {
	if (browser.runtime.getBrowserInfo != undefined) {
		const browserInfo = await apiToPromise(browser.runtime.getBrowserInfo)();
		if (browser.name == "firefox") {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

async function makePromptWindow({ permissions, origins }) {
	const url = new URL('prompt.html', location.origin);
	url.searchParams.set('permissions', JSON.stringify(permissions));
	url.searchParams.set('origins', JSON.stringify(origins));

	const width = 630;
	const height = 255;

	// Get the current window's dimensions and calculate center position
	const { width: screenWidth, height: screenHeight } = await chrome.windows.getCurrent() || { width: 1920, height: 1080 };
	const left = Math.floor(screenWidth / 2 - width / 2);
	const top = Math.floor(screenHeight / 2 - height / 2);

	let id = -1;
	// Firefox specific workaround: For some versions of firefox, windows of type popup created via `chrome.windows.create`
	// cannot request permissions. Weirdly enough popups created by `window.open` can. I assume this is because the former
	// doesn't have a location bar, but the latter does. We work around this by just opening a new tab in firefox.
	if (isFirefox()) {
		const tab = await apiToPromise(chrome.tabs.create)({ url: url.href });
		id = tab.id;
	} else {
		const { tabs: [tab] } = await apiToPromise(chrome.windows.create)({ url: url.href, type: 'popup', width, height, left, top });
		id = tab.id;
	}

	return new Promise(resolve => {
		function updateListener(tabId, updates) {
			if (tabId !== id) return;

			const url = updates.url && new URL(updates.url);
			if (url && url.searchParams.has('result')) {
				stopListening();
				const result = url.searchParams.get('result');
				if (!result) return;
				resolve(JSON.parse(result));
				apiToPromise(chrome.tabs.remove)(id);
			}
		}

		function removeListener(tabId) {
			if (tabId !== id) return;
			stopListening();
			resolve(false);
		}

		function stopListening() {
			chrome.tabs.onUpdated.removeListener(updateListener);
			chrome.tabs.onRemoved.removeListener(removeListener);
		}

		chrome.tabs.onUpdated.addListener(updateListener);
		chrome.tabs.onRemoved.addListener(removeListener);
	});
}
