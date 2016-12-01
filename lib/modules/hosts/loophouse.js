/* @flow */

import { Host } from '../../core/host';

export default new Host('loophouse', {
	name: 'loophouse',
	attribution: true,
	domains: ['loophouse.tv'],
	logo: '//loophouse.tv/favicon.ico',
	detect: ({ pathname, hostname, search }) => {
		const split = pathname.substring(1).split('/');

		if (split.length > 1) {
			if (split[0] === "l") {
				return split[1];
			}
		}

		return false;
	},
	handleLink(href, hash) {
		return {
			type: 'IFRAME',
			embed: `https://loophouse.tv/l/${hash}?playercard=1&autoplay=1&muted=0&utm_source=reddit&utm_medium=res`,
			fixedRatio: false,
		};
	},
});
