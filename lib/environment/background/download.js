/* @flow */

import { addListener } from './messaging';

addListener('download', ({ url, filename }, { incognito }) => {
	if (process.env.BUILD_TARGET === 'chrome' || process.env.BUILD_TARGET === 'edge') {
		// Adding `download` permission to Chrome would require a permissions dialog,
		// and would provide no benefit, since Chrome properly supports <a download>
		const a = document.createElement('a');
		a.href = url;
		a.download = filename || '';
		a.click();
	} else if (process.env.BUILD_TARGET === 'firefox') {
		// Firefox <a download> is same-origin only
		chrome.downloads.download({ url, filename, incognito });
	}
});
