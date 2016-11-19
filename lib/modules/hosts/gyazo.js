/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('gyazo', {
	name: 'gyazo',
	domains: ['gyazo.com'],
	permissions: ['https://api.gyazo.com/api/oembed*'],
	logo: 'https://gyazo.com/favicon.ico',
	detect: ({ pathname }) => (/^\/\w{32}\b/i).test(pathname),
	async handleLink(href) {
		const { url } = await ajax({
			url: 'https://api.gyazo.com/api/oembed',
			data: { url: href },
			type: 'json',
		});

		return {
			type: 'IMAGE',
			src: url,
		};
	},
});
