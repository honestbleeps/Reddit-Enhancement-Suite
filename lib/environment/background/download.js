/* @flow */

import { addListener } from './messaging';

addListener('download', ({ url, filename }, { tab: { incognito } }) => {
	chrome.downloads.download({ url, filename, incognito });
});
