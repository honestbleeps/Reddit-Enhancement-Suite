/* @flow */

import { Host } from '../../core/host';
import { DAY } from '../../utils';
import { ajax } from '../../environment';

export default new Host('supload', {
	name: 'supload',
	domains: ['supload.com'],
	logo: 'https://supload.com/favicon.ico',
	detect: ({ pathname }) => (/^\/([A-Za-z0-9_-]+)/i).exec(pathname),
	async handleLink(href, [, id]) {
		const data = await ajax({
			url: 'https://www.supload.com/oembed',
			query: { url: `https://supload.com/${id}`, format: 'json' },
			type: 'json',
			cacheFor: DAY,
		});

		if (data.type === 'photo') {
			return {
				type: 'IMAGE',
				src: data.url,
			};
		} else {
			return {
				type: 'VIDEO',
				loop: true,
				muted: true,
				sources: [{
					source: data.webmUrl,
					type: 'video/webm',
				}, {
					source: data.mp4Url,
					type: 'video/mp4',
				}],
			};
		}
	},
});
