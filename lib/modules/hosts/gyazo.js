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

		switch (info.type) {
			case 'photo':
				return {
					type: 'IMAGE',
					src: info.url,
				};
			case 'video':
				return {
					type: 'VIDEO',
					controls: false,
					muted: true,
					loop: true,
					fallback: `https://i.gyazo.com/${id}.gif`,
					sources: [{
						source: `https://i.gyazo.com/${id}.mp4`,
						type: 'video/mp4',
					}],
				};
			default:
				throw new Error(`Invalid media type: ${info.type}`);
		}
	},
});
