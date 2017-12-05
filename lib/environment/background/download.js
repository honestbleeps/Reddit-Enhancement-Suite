/* @flow */

import { addListener } from './messaging';

addListener('download', ({ url, filename }, { incognito }) => {
	// Only used in Firefox, see this file's foreground counterpart
	chrome.downloads.download({ url, filename, incognito });
});
