/* @flow */

import { sendMessage } from './messaging';

export function download(url: string, filename?: string) {
	if (process.env.BUILD_TARGET === 'chrome' || process.env.BUILD_TARGET === 'firefox') {
		// Firefox and Chrome <a download> is same-origin only
		sendMessage('download', {
			// resolve relative URLs
			url: new URL(url, location.href).href,
			filename,
		});
	} else if (process.env.BUILD_TARGET === 'edge') {
		// Edge allows cross-origin <a download>
		const a = document.createElement('a');
		a.href = url;
		a.download = filename || '';
		a.click();
	}
}
