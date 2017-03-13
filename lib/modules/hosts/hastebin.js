/* @flow */

import { Host } from '../../core/host';

export default new Host('hastebin', {
	name: 'hastebin',
	domains: ['hastebin.com'],
	attribution: false,
	detect: ({ href }) => (/^https?:\/\/(?:www\.)?hastebin\.com\/(?:raw\/)?(.+)/i).exec(href),
	handleLink(href, [, filename]) {
		return {
			type: 'IFRAME',
			expandoClass: 'selftext',
			muted: true,
			embed: `https://hastebin.com/${filename}`,
			height: '500px',
			width: '100%',
		};
	},
});
