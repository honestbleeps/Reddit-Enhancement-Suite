/* @flow */

import { Host } from '../../core/host';

export default new Host('znipe', {
	name: 'ZnipeTV',
	domains: ['beta.znipe.tv', 'www.znipe.tv'],
	logo: 'https://assets.znipe.tv/icons/favicon.jpg',
	detect: ({ searchParams }) => {
		if(searchParams.has('m')) return searchParams.get('m');
		if(searchParams.has('v')) return searchParams.get('v');
	},
	handleLink(href, clipId) {
		return {
			type: 'IFRAME',
			embed: `https://beta.znipe.tv/watch?m=${clipId}`,
		};
	},
});
