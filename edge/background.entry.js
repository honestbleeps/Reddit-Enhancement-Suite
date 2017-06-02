/* @flow */

/* eslint-env webextensions */

import { addListener } from '../browser/background';
import { apiToPromise } from '../browser/utils/api';

// Edge doesn't have history.*
addListener('addURLToHistory', () => {});
addListener('isURLVisited', () => false);

const waiting = new Map();

addListener('authFlow', async ({ domain, clientId, scope, interactive }) => {
	if (!interactive) throw new Error('Edge does not support noninteractive auth.');

	const url = new URL(domain);
	url.search = [
		`client_id=${encodeURIComponent(clientId)}`,
		`scope=${encodeURIComponent(scope)}`,
		`redirect_uri=${encodeURIComponent('https://redditenhancementsuite.com/oauth')}`,
		'response_type=token',
	].join('&');

	const { tabs } = await apiToPromise(chrome.windows.create)({ type: 'popup', focused: true, url: url.href });

	return new Promise((resolve, reject) => waiting.set(tabs[0].id, { resolve, reject }));
});

addListener('authFlowComplete', (info, { id, url }) => {
	const handler = waiting.get(id);
	if (!handler) throw new Error(`No auth handler for id: ${id}, url: ${url}.`);
	waiting.delete(id);

	const tokenMatch = (/[?&#]access_token=([^&]+)/).exec(url);
	if (tokenMatch) {
		handler.resolve(tokenMatch[1]);
	} else {
		handler.reject('No access_token found.');
	}

	apiToPromise(chrome.tabs.remove)(id);
});

chrome.tabs.onRemoved.addListener(id => {
	const handler = waiting.get(id);
	if (!handler) return;
	waiting.delete(id);

	handler.reject(new Error('User cancelled or denied access.'));
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
