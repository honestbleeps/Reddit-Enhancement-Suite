/* @flow */

import { Host } from '../../core/host';

export default new Host('pastebin', {
	name: 'pastebin',
	domains: ['pastebin.com'],
	attribution: false,
	detect: ({ href }) => (/^https?:\/\/(?:www\.)?pastebin\.com\/(?:raw\.php\?i=|index\/)?([a-z0-9]{8})/i).exec(href),
	handleLink(href, [, id]) {
		return {
			type: 'IFRAME',
			expandoClass: 'selftext',
			muted: true,
			embed: `https://pastebin.com/embed_iframe.php?i=${id}`,
			height: '500px',
			width: '100%',
		};
	},
});
