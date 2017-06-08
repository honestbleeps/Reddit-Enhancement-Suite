/* @flow */

import { Host } from '../../core/host';

export default new Host('adultswim', {
	name: 'Adult Swim',
	domains: ['adultswim.com'],
	logo: 'https://www.adultswim.com/favicon.ico',
	detect: ({ pathname }) => (/^\/videos\/([^\/]+\/[^\/]+)(?:\/|$)/i).exec(pathname),
	handleLink(href, [, path]) {
		return {
			type: 'IFRAME',
			embed: `https://www.adultswim.com/utilities/embed/${path}`,
			fixedRatio: true,
		};
	},
});
