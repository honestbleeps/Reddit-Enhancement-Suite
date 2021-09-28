/* @flow */

import { Host } from '../../core/host';

export default new Host('streamwo', {
	name: 'streamwo',
	domains: ['streamwo.com'],
	logo: 'https://streamwo.com/favicon.png',
	detect: ({ pathname }) => (/^\/([^\/]+)$/i).exec(pathname),
	handleLink(href, [, code]) {
		return {
			type: 'VIDEO',
			loop: true,
			sources: [{
				source: `https://bunny.streamwo.com/${code}.mp4`,
				type: 'video/mp4',
			}],
		};
	},
});
