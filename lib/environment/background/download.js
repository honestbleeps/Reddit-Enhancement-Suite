/* @flow */

import { isFirefox, shouldUseControlledDownloads } from '../utils/capabilities';
import { addListener } from './messaging';

addListener('download', ({ url, filename }, { tab: { incognito } }) => {
	if (!shouldUseControlledDownloads() || !chrome.downloads) return;
	chrome.downloads.download({ url, filename, ...(isFirefox ? { incognito } : {}) });
});
