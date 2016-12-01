/* @flow */

import { Host } from '../../core/host';

export default new Host('loophouse', {
	name: 'loophouse',
	domains: ['loophouse.tv'],
	logo: '//loophouse.tv/favicon.ico',
	detect: ({ pathname }) => (/^\/l\/([\w-]+)(?:\/|$)/i).exec(pathname),
	handleLink(href, [, hash]) {
		const embed = `https://loophouse.tv/l/${hash}?playercard=1&muted=0&utm_source=reddit&utm_medium=res`;
		return {
			type: 'IFRAME',
			embed: `${embed}&autoplay=0`,
			embedAutoplay: `${embed}&autoplay=1`,
			fixedRatio: false,
		};
	},
});
