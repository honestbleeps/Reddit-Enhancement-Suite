/* @flow */

import { addListener, sendMessage } from './messaging';

chrome.pageAction.onClicked.addListener(tab => {
	sendMessage('pageActionClick', undefined, tab.id);
});

addListener('pageAction', ({ operation, state }, { tab }) => {
	switch (operation) {
		case 'show':
			chrome.pageAction.show(tab.id);
			chrome.pageAction.setIcon({
				tabId: tab.id,
				path: {
					'19': state ? 'css-on-small.png' : 'css-off-small.png', // eslint-disable-line quote-props
					'38': state ? 'css-on.png' : 'css-off.png', // eslint-disable-line quote-props
				},
			});
			chrome.pageAction.setTitle({
				tabId: tab.id,
				title: state ? 'Subreddit Style On' : 'Subreddit Style Off',
			});
			break;
		case 'hide':
			chrome.pageAction.hide(tab.id);
			break;
		default:
			throw new Error(`Invalid pageAction operation: ${operation}`);
	}
});
