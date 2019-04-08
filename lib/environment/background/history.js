/* @flow */

import { apiToPromise } from '../utils/api';
import { addListener } from './messaging';

addListener('addURLToHistory', url => {
	chrome.history.addUrl({ url });
});

addListener('isURLVisited', async url => {
	const visits = await apiToPromise(chrome.history.getVisits)({ url });
	return visits.length > 0;
});
