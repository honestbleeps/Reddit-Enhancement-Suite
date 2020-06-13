/* @flow */

import { Host } from '../../core/host';

export default new Host('gamerdvr', {
	name: 'GamerDVR',
	domains: ['gamerdvr.com'],
	logo: 'https://gamerdvr.com/assets/favicon-240671aabcbf14dcaa1f3f2b406091d2.png',
	detect: ({ pathname }) => (/^\/(gamer\/[^\/]+\/\w+\/\d+)(?:\/|$)/).exec(pathname),
	handleLink(href, [, path]) {
		return {
			type: 'IFRAME',
			embed: `https://gamerdvr.com/${path}/embed`,
			fixedRatio: true,
		};
	},
});
