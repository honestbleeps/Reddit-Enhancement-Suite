/* @flow */

import { supportsHistory } from '../utils/capabilities';
import { apiToPromise } from '../utils/api';
import { addListener } from './messaging';

addListener('addURLToHistory', url => {
	if (!supportsHistory || !chrome.history) return;
	chrome.history.addUrl({ url });
});

addListener('isURLVisited', async url => {
	if (!supportsHistory || !chrome.history) return false;
	const visits = await apiToPromise(chrome.history.getVisits)({ url });
	return visits.length > 0;
});
