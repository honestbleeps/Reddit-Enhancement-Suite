/* @flow */

import { Host } from '../../core/host';

export default new Host('snag', {
	name: 'snag.gy',
	logo: 'https://snaggys3static-snaggy.netdna-ssl.com/favicon.png',
	domains: ['snag.gy'],
	detect: ({ pathname }) => (/^\/(\w{5})(?:\.(\w+))?/i).exec(pathname),
	handleLink(href, [, id, extension]) {
		return {
			type: 'IMAGE',
			src: `https://i.snag.gy/${id}.${extension || 'jpg'}`,
		};
	},
});
