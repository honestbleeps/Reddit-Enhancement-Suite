/* @flow */

import { apiToPromise } from '../utils/api';
import { isFirefox, supportsActionClickBootstrap } from '../utils/capabilities';
import { reportDiagnostic } from '../utils/diagnostics';
import { callActionMethod, handleToolbarClick } from './action';
import { addListener, sendMessage } from './messaging';

const actionApi = isFirefox ? chrome.pageAction : chrome.action;
const missingActionMethods = new Set();
let reportedMissingTabContext = false;

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

function reportMissingActionMethod(methodName: string) {
	if (missingActionMethods.has(methodName)) return;
	missingActionMethods.add(methodName);

	reportDiagnostic({
		level: 'warn',
		message: `Ignoring unavailable toolbar action method: ${methodName}`,
		source: 'background',
		stage: 'pageAction',
	});
}

function callSafely(methodName: string, ...args: mixed[]) {
	if (!callActionMethod(actionApi, methodName, ...args)) {
		reportMissingActionMethod(methodName);
		return false;
	}

	return true;
}

async function openDiagnosticsPage() {
	await apiToPromise(chrome.tabs.create)({
		active: true,
		url: chrome.runtime.getURL('debug.html'),
	});
}

if (actionApi && actionApi.onClicked && typeof actionApi.onClicked.addListener === 'function') {
	actionApi.onClicked.addListener(tab => handleToolbarClick(tab.id, {
		openDiagnosticsPage,
		reportError(stage, error) {
			console.error(`Failed to handle ${stage}:`, error);
			reportDiagnostic({
				level: 'error',
				message: error.message,
				source: 'background',
				stack: error.stack || '',
				stage,
			});
		},
		sendClickMessage: tabId => sendMessage('pageActionClick', undefined, tabId),
		bootstrapActionClick,
		supportsActionClickBootstrap,
	}));
} else {
	reportDiagnostic({
		level: 'warn',
		message: 'Toolbar click listener API is unavailable.',
		source: 'background',
		stage: 'pageAction',
	});
}

addListener('pageAction', ({ operation, state }, { tab }) => {
	if (!tab || !tab.id) {
		if (!reportedMissingTabContext) {
			reportedMissingTabContext = true;
			reportDiagnostic({
				level: 'warn',
				message: 'Received pageAction request without a sender tab. Ignoring.',
				source: 'background',
				stage: 'pageAction',
			});
		}

		return;
	}

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
