/* @flow */

import { addListener, sendMessage } from './messaging';

chrome.action.onClicked.addListener(tab => {
	sendMessage('actionClick', undefined, tab.id);
});

addListener('action', ({ operation, state }, { tab }) => {
	switch (operation) {
		case 'show':
			chrome.action.show(tab.id);
			chrome.action.setIcon({
				tabId: tab.id,
				path: {
					'19': state ? 'css-on-small.png' : 'css-off-small.png', // eslint-disable-line quote-props
					'38': state ? 'css-on.png' : 'css-off.png', // eslint-disable-line quote-props
				},
			});
			chrome.action.setTitle({
				tabId: tab.id,
				title: state ? 'Subreddit Style On' : 'Subreddit Style Off',
			});
			break;
		case 'hide':
			chrome.action.hide(tab.id);
			break;
		default:
			throw new Error(`Invalid action operation: ${operation}`);
	}
});
