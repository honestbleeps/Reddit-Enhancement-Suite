import { ajax } from '../../environment';

export default {
	moduleID: 'vidlit',
	name: 'vidlit',
	domains: ['vidl.it'],
	logo: 'https://vidl.it/favicon.ico',
	detect: ({ href }) => (/^https?:\/\/vidl.it\/([A-Za-z0-9]+)$/i).exec(href),
	async handleLink(href, [, hash]) {
		const oEmbed = await ajax({
			url: `https://vidl.it/oembed?url=${encodeURIComponent(href)}&maxwidth=640&format=json`,
			type: 'json',
		});
		return {
			type: 'IFRAME',
			embed: `https://vidl.it/oembed/${hash}`,
			width: `${oEmbed.width}px`,
			height: `${oEmbed.height}px`,
		};
	},
};
