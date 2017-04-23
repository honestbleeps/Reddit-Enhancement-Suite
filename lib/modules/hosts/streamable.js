/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('streamable', {
	name: 'streamable',
	domains: ['streamable.com'],
	logo: 'https://cdn-e2.streamable.com/static/14a98f7cb1ddc5213329c039dc39cac543ba410f/img/favicon.ico',
	detect: ({ pathname }) => (/^\/(?:e\/)?(\w+)$/i).exec(pathname),
	async handleLink(href, [, hash]) {
		const {
			title,
			files: { mp4: { url } },
			thumbnail_url: thumbnail,
			source,
		} = await ajax({
			url: `https://api.streamable.com/videos/${hash}`,
			type: 'json',
		});

		return {
			type: 'VIDEO',
			title,
			loop: true,
			sources: [{
				source: url,
				type: 'video/mp4',
			}],
			poster: thumbnail,
			source,
		};
	},
});
