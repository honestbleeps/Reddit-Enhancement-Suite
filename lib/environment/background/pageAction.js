/* @flow */

import { apiToPromise } from '../utils/api';
import { isFirefox, supportsActionClickBootstrap } from '../utils/capabilities';
import { callActionMethod, handleToolbarClick } from './action';
import { addListener, sendMessage } from './messaging';

const actionApi = isFirefox ? chrome.pageAction : chrome.action;

async function bootstrapActionClick(tabId: number) {
	await apiToPromise(chrome.scripting.insertCSS)({
		target: { tabId, allFrames: true },
		files: ['res.css'],
	});

	await apiToPromise(chrome.scripting.executeScript)({
		target: { tabId, allFrames: true },
		files: ['foreground.entry.js'],
	});
}

function callSafely(methodName: string, ...args: mixed[]) {
	return callActionMethod(actionApi, methodName, ...args);
}

if (actionApi && actionApi.onClicked && typeof actionApi.onClicked.addListener === 'function') {
	actionApi.onClicked.addListener(tab => handleToolbarClick(tab && tab.id, {
		reportError(stage, error) {
			console.error(`Failed to handle ${stage}:`, error);
		},
		sendClickMessage: tabId => sendMessage('pageActionClick', undefined, tabId),
		bootstrapActionClick,
		supportsActionClickBootstrap,
	}));
}

addListener('pageAction', ({ operation, state }, { tab }) => {
	if (!tab || !tab.id) return;

	switch (operation) {
		case 'show':
			callSafely(isFirefox ? 'show' : 'enable', tab.id);
			callSafely('setIcon', {
				tabId: tab.id,
				path: {
					'19': state ? 'css-on-small.png' : 'css-off-small.png', // eslint-disable-line quote-props
					'38': state ? 'css-on.png' : 'css-off.png', // eslint-disable-line quote-props
				},
			});
			callSafely('setTitle', {
				tabId: tab.id,
				title: state ? 'Subreddit Style On' : 'Subreddit Style Off',
			});
			break;
		case 'hide':
			callSafely(isFirefox ? 'hide' : 'disable', tab.id);
			break;
		default:
			throw new Error(`Invalid action operation: ${operation}`);
	}
});
