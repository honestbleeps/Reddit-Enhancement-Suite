/* @flow */

import { shouldUseControlledDownloads } from '../utils/capabilities';
import { sendMessage } from './messaging';
import { openNewTab } from './tabs';

export function download(url: string, filename?: string) {
	url = new URL(url, location.href).href;

	if (!shouldUseControlledDownloads()) {
		openNewTab(url);
		return;
	}

	// Firefox and Chrome <a download> is same-origin only
	sendMessage('download', {
		url,
		filename,
	});
}
