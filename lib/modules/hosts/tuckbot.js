/* @flow */

import { Host } from '../../core/host';

export default new Host('tuckbot', {
	name: 'TuckBot.tv',

	domains: ['tuckbot.tv'],

	attribution: false,

	// sample URL: https://tuckbot.tv/#/watch/gq09xf
	detect: ({ hostname, hash }) => {
		const [, route, redditPostId] = hash.split('/');
		if (route === 'watch') return [hostname, redditPostId];
	},

	handleLink(_href, [, id]) {
		return {
			type: 'IFRAME',
			embed: `https://tuckbot.tv/#/embed/${id}`,
			fixedRatio: true,
		};
	},
});
