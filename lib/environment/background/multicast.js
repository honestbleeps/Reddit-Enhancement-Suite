/* @flow */

import { apiToPromise } from '../utils/api';
import { addListener, sendMessage } from './messaging';

addListener('multicast', async ({ name, args, crossContext }, sender) => {
	// Firefox has more than just (non)incognito, so we must limit to each cookieStoreId.
	const CONTEXT_KEY = process.env.BUILD_TARGET === 'firefox' ? 'cookieStoreId' : 'incognito';

	const redditTabs = await apiToPromise(chrome.tabs.query)({ url: 'https://*.reddit.com/*', status: 'complete' });
	const nonSelfTabsInSameContext = redditTabs
		.filter(tab => (
			(sender.frameId || tab.id !== sender.tab.id) &&
			(crossContext || tab[CONTEXT_KEY] === sender[CONTEXT_KEY])
		));

	return Promise.all(nonSelfTabsInSameContext.map(({ id: tabId }) => sendMessage('multicast', { name, args }, tabId)));
});
