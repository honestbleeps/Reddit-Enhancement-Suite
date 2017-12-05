/* @flow */

import { apiToPromise } from '../utils/api';
import { addListener, sendMessage } from './messaging';

addListener('multicast', async ({ name, args, crossIncognito }, { id: tabId, incognito }) =>
	Promise.all(
		(await apiToPromise(chrome.tabs.query)({ url: '*://*.reddit.com/*', status: 'complete' }))
			.filter(tab => tab.id !== tabId && (crossIncognito || tab.incognito === incognito))
			.map(({ id: tabId }) => sendMessage('multicast', { name, args }, tabId))
	)
);
