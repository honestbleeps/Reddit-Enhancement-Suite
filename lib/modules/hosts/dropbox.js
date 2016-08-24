/* @flow */

import { Host } from '../../core/host';
import { genericHosts } from '../showImages';

export default new Host('dropbox', {
	name: 'dropbox',
	domains: ['dropbox.com'],
	logo: 'https://cfl.dropboxstatic.com/static/images/favicon-vflk5FiAC.ico',
	detect(url) {
		for (const host of genericHosts) {
			const result = host.detect(url);
			if (result) return [host.handleLink, result];
		}
	},
	handleLink(href, [handler, result]) {
		const originalURL = new URL(href);
		return handler(`${originalURL.origin}${originalURL.pathname}?raw=1`, result);
	},
});
