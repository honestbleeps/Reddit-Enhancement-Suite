/* @flow */

import cssOff from '../../../images/css-off.png';
import cssOffSmall from '../../../images/css-off-small.png';
import cssOn from '../../../images/css-on.png';
import cssOnSmall from '../../../images/css-on-small.png';
import { addListener, sendMessage } from './messaging';

chrome.pageAction.onClicked.addListener(({ id: tabId }) => {
	sendMessage('pageActionClick', undefined, tabId);
});

addListener('pageAction', ({ operation, state }, { id: tabId }) => {
	switch (operation) {
		case 'show':
			chrome.pageAction.show(tabId);
			chrome.pageAction.setIcon({
				tabId,
				path: { /* eslint-disable quote-props */
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
