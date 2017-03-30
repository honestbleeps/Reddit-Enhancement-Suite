/* @flow */

import { sendMessage } from '../../browser';

export function download(url: string, filename?: string) {
	return sendMessage('download', {
		// resolve relative URLs
		url: new URL(url, location.href).href,
		filename,
	});
}
