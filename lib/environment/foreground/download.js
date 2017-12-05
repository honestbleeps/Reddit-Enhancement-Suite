/* @flow */

import { sendMessage } from './messaging';

export function download(url: string, filename?: string) {
	if (process.env.BUILD_TARGET === 'chrome' || process.env.BUILD_TARGET === 'edge') {
		// Chrome and Edge properly support <a download>
		const a = document.createElement('a');
		a.href = url;
		a.download = filename || '';
		a.click();
	} else if (process.env.BUILD_TARGET === 'firefox') {
		// Firefox <a download> is same-origin only
		sendMessage('download', {
			// resolve relative URLs
			url: new URL(url, location.href).href,
			filename,
		});
	}
}
