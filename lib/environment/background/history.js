/* @flow */

import { apiToPromise } from '../utils/api';
import { addListener } from './messaging';

addListener('addURLToHistory', url => {
	if (process.env.BUILD_TARGET === 'chrome' || process.env.BUILD_TARGET === 'firefox') {
		chrome.history.addUrl({ url });
	} else if (process.env.BUILD_TARGET === 'edge') {
		// Edge doesn't have history.*
	}
});

addListener('isURLVisited', async url => {
	if (process.env.BUILD_TARGET === 'chrome' || process.env.BUILD_TARGET === 'firefox') {
		const visits = await apiToPromise(chrome.history.getVisits)({ url });
		return visits.length > 0;
	} else if (process.env.BUILD_TARGET === 'edge') {
		// Edge doesn't have history.*
		return false;
	}
});
