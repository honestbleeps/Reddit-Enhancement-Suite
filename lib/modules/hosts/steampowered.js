/* @flow */

import { Host } from '../../core/host';

export default new Host('steampowered', {
	name: 'Steam',
	logo: 'https://store.steampowered.com/favicon.ico',
	domains: ['steampowered.com', 'steamusercontent.com'],
	detect: ({ pathname }) => (/^\/ugc\/(\d{15,20}\/\w{40})(?:$|\/)/i).exec(pathname),
	handleLink(href, [pathname]) {
		return {
			type: 'IMAGE',
			src: `http://images.akamai.steamusercontent.com${pathname}`,
		};
	},
});
