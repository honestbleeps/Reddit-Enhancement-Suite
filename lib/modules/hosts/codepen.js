/* @flow */

import { sanitize } from 'dompurify';
import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('codepen', {
	name: 'CodePen',
	domains: ['codepen.io'],
	permissions: ['https://codepen.io/api/oembed'],
	logo: 'https://codepen.io/favicon.ico',
	detect: ({ pathname }) => (/^\/(?!anon)([a-z0-9_-]+)\/(?:pen|full|details|debug)\/([a-z]+)\b/i).exec(pathname),
	async handleLink(href, [, user, hash]) {
		const { html } = await ajax({
			url: 'https://codepen.io/api/oembed',
			query: {
				url: `https://codepen.io/${user}/pen/${hash}`,
				format: 'json',
			},
			type: 'json',
		});

		const iframe = sanitize(html, { RETURN_DOM_FRAGMENT: true, ALLOWED_TAGS: ['iframe'] }).children[0];

		return {
			type: 'IFRAME',
			muted: true,
			height: '500px',
			width: '700px',
			expandoClass: 'selftext',
			embed: iframe.src,
		};
	},
});
