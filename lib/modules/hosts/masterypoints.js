/* @flow */

import { Host } from '../../core/host';

export default new Host('masterypoints', {
	name: 'MasteryPoints',
	domains: ['masterypoints.com', 'www.masterypoints.com'],
	logo: 'https://www.masterypoints.com/favicon.ico',
	detect: ({ pathname }) => (/^\/player\/(.{3,30})\/([a-zA-Z]{0,4})\b/i).exec(pathname),
	handleLink(href, [, player, server]) {
		return {
			type: 'IFRAME',
			muted: true,
			embed: `https://www.masterypoints.com/oembed/player/${player}/${server}`,
			height: '600px',
			width: '600px',
		};
	},
});
