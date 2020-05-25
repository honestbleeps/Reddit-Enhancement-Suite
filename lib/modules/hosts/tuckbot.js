/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('tuckbot', {
	name: 'TuckBot.tv',

	domains: ['tuckbot.tv'],

	attribution: false,

	// sample URL: https://tuckbot.tv/#/watch/gq09xf
	detect: ({ hostname, hash }) => {
		const [, route, redditPostId] = hash.split('/');
		if (route === 'watch') return [hostname, redditPostId];
	},

	async handleLink(href, [, id]) {
		const response = await ajax({
			url: `https://api.tuckbot.tv/public/video/${id}`,
			type: 'json',
		});

		return {
			type: 'VIDEO',
			sources: [
				{
					source: response.data.mirrorUrl,
					type: 'video/mp4',
				},
			],
		};
	},
});
