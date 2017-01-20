/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('vidlit', {
	name: 'vidlit',
	domains: ['vidl.it'],
	logo: 'https://vidl.it/favicon.ico',
	detect: ({ pathname }) => (/^\/([A-Za-z0-9]+)$/i).exec(pathname),
	async handleLink(href, [, hash]) {
		const oEmbed = await ajax({
			url: 'https://vidl.it/oembed',
			data: { url: href, maxwidth: 640, format: 'json' },
			type: 'json',
		});
		return {
			type: 'IFRAME',
			embed: `https://vidl.it/oembed/${hash}`,
			width: `${oEmbed.width}px`,
			height: `${oEmbed.height}px`,
			fixedRatio: true,
		};
	},
});
