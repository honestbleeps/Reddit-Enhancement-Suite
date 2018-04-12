/* @flow */

import { addListener } from './messaging';

addListener('download', ({ url, filename }, { incognito }) => {
	if (process.env.BUILD_TARGET === 'chrome') {
		chrome.downloads.download({ url, filename });
	} else if (process.env.BUILD_TARGET === 'firefox') {
		chrome.downloads.download({ url, filename, incognito });
	} else if (process.env.BUILD_TARGET === 'edge') {
		// Edge doesn't have downloads.*
	}
});
