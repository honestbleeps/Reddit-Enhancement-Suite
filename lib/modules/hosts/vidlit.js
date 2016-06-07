import { ajax } from '../../environment';

export default {
	moduleID: 'vidlit',
	name: 'vidlit',
	domains: ['vidl.it'],
	logo: 'https://vidl.it/favicon.ico',
	detect: ({ href }) => (/^https?:\/\/vidl.it\/([A-Za-z0-9]+)$/i).exec(href),
	async handleLink(href, [, hash]) {
		const meta = await ajax({
			url: `https://vidl.it/embed/meta/${hash}`,
			type: 'json',
		});
		return {
			type: 'IFRAME',
			embed: `https://vidl.it/embed/${hash}`,
			width: `${meta.data.iframe.width}px`,
			height: `${meta.data.iframe.height}px`,
		};
	},
};
