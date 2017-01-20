/* @flow */

import { Host } from '../../core/host';

export default new Host('oddshot', {
	domains: ['oddshot.tv'],
	logo: '//oddshot.tv/favicon.ico',
	name: 'Oddshot',
	detect: ({ pathname }) => (/^\/shot\/([a-z0-9_-]+(?:\/[a-z0-9_-]+)?)/i).exec(pathname),
	handleLink(href, [, hash]) {
		const embed = `//oddshot.tv/shot/${hash}/embed`;

		return {
			type: 'IFRAME',
			embed,
			embedAutoplay: `${embed}?autoplay=true`,
			fixedRatio: true,
		};
	},
});
