/* @flow */

import { sendMessage } from './messaging';

export function download(url: string, filename?: string) {
	// Firefox and Chrome <a download> is same-origin only
	sendMessage('download', {
		// resolve relative URLs
		url: new URL(url, location.href).href,
		filename,
	});
}
