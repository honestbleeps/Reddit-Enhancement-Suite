
import { ajax } from '../../environment';

export default {
	moduleID: 'vidlit',
	name: 'vidlit',
	domains: ['vidl.it'],
	logo: 'https://vidl.it/favicon.ico',
	detect: href => (/^https?:\/\/vidl.it\/([A-Za-z0-9]+)$/i).exec(href),
	async handleLink(elem, [, hash]) {
		const meta = await ajax({
			url: `https://vidl.it/embed/meta/${hash}`,
			type: 'json',
		});
		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', `https://vidl.it/embed/${hash}`);
		elem.setAttribute('data-width', meta.data.iframe.width);
		elem.setAttribute('data-height', meta.data.iframe.height);
	},
};
