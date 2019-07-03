/* @flow */

import { Host } from '../../core/host';

export default new Host('ppy.sh', {
	name: 'ppy.sh',
	domains: ['osu.ppy.sh'],
	logo: 'https://s.ppy.sh/favicon.ico',
	detect: ({ pathname }) => (/^\/ss\/(\d+(?:\/[0-9a-f]+)?)/i).exec(pathname),
	handleLink(href, [, code]) {
		return {
			type: 'IMAGE',
			src: `https://osu.ppy.sh/ss/${code}`,
		};
	},
});
