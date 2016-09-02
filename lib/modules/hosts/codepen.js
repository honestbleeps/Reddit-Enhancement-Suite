import { $ } from '../../vendor';
import { ajax } from '../../environment';

export default {
	moduleID: 'codepen',
	name: 'CodePen',
	domains: ['codepen.io'],
	permissions: ['https://codepen.io/api/oembed*'],
	logo: 'https://codepen.io/favicon.ico',
	detect: ({ pathname }) => (/^\/(?!anon)([a-z0-9_-]+)\/(?:pen|full|details|debug)\/([a-z]+)\b/i).exec(pathname),
	async handleLink(href, [, user, hash]) {
		const { html } = await ajax({
			url: 'https://codepen.io/api/oembed',
			data: {
				url: `https://codepen.io/${user}/pen/${hash}`,
				format: 'json',
				height: 500,
			},
			type: 'json',
		});

		return {
			type: 'GENERIC_EXPANDO',
			muted: true,
			generate: () => $(html).get(0),
		};
	},
};
