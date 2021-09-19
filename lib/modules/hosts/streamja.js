/* @flow */

import { Host } from '../../core/host';

export default new Host('streamja', {
	name: 'streamja',
	domains: ['streamja.com'],
	logo: 'https://streamja.com/favicon.ico',
	detect: ({ pathname }) => (/^\/([^\/]+)$/i).exec(pathname),
	handleLink(href, [, code]) {
		const short = code.substring(0, 2).toLowerCase();
		return {
			type: 'VIDEO',
			loop: true,
			sources: [{
				source: `https://tiger.cdnja.co/v/mp4/${short}/${code}.mp4`,
				type: 'video/mp4',
			}],
			poster: `https://tiger.cdnja.co/i/${short}/${code}.jpg`,
		};
	},
});
