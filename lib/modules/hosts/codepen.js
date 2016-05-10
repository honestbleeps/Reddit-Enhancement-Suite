import { $ } from '../../vendor';
import { Permissions, ajax } from '../../environment';

export default {
	moduleID: 'codepen',
	name: 'CodePen',
	domains: ['codepen.io'],
	logo: 'https://codepen.io/favicon.ico',
	detect: href => (/^https?:\/\/(?:s\.)?codepen.io\/(?!anon)([a-z0-9_-]+)\/(?:pen|full|details|debug)\/([a-z]+)\b/i).exec(href),
	async handleLink(elem, [, user, hash]) {
		await Permissions.request('https://codepen.io/api/oembed*');

		const { html } = await ajax({
			url: 'https://codepen.io/api/oembed',
			data: {
				url: `https://codepen.io/${user}/pen/${hash}`,
				format: 'json',
				height: 500,
			},
			type: 'json',
		});

		elem.type = 'GENERIC_EXPANDO';
		elem.expandoOptions = {
			generate: () => $(html).get(0),
			media: {},
		};
	},
};
