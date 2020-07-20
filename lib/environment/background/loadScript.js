/* @flow */

import { apiToPromise } from '../utils/api';
import { addListener } from './messaging';

addListener('loadScript', async ({ url }, { tab: { id: tabId }, frameId }) => {
	await apiToPromise(chrome.tabs.executeScript)(tabId, { file: url, frameId, runAt: 'document_start' });
});
