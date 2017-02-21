/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('gyazo', {
	name: 'gyazo',
	domains: ['gyazo.com'],
	permissions: ['https://api.gyazo.com/api/oembed*'],
	logo: 'https://gyazo.com/favicon.ico',
	detect: ({ pathname }) => (/^\/(\w{32})\b/i).exec(pathname),
	async handleLink(href, [, id]) {
		const info = await ajax({
			url: 'https://api.gyazo.com/api/oembed',
			data: { url: href },
			type: 'json',
		});

		if (!info.type) {
			throw new Error('Could not determine media type.');
		}

		if (info.type === 'photo') {
			return {
				type: 'IMAGE',
				src: info.url,
			};
		} else {
			return {
				type: 'IFRAME',
				embed: `https://api.gyazo.com/player/${id}`,
			};
		}
	},
});
