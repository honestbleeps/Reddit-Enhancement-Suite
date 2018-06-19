/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';
import logo from '../../images/hosts/giphy-logo.png';

export default new Host('giphy', {
	name: 'giphy',
	domains: ['giphy.com'],
	logo,
	detect: ({ pathname }) => (/^(?:\/gifs|\/media|)\/(?:\w+-)*([^/.]+)(?:\/|\.gif|$)/i).exec(pathname),
	async handleLink(href, [, id]) {
		const { data } = await ajax({
			url: `https://api.giphy.com/v1/gifs/${id}`,
			query: { api_key: 'dc6zaTOxFJmzC' },
			type: 'json',
		});

		return {
			type: 'VIDEO',
			fallback: data.images.original.url,
			loop: true,
			muted: true,
			sources: [{
				source: data.images.original.mp4,
				type: 'video/mp4',
			}],
		};
	},
});
