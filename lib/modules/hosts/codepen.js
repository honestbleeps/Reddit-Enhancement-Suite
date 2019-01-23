/* @flow */

import { $ } from '../../vendor';
import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('codepen', {
	name: 'CodePen',
	domains: ['codepen.io'],
	permissions: ['https://codepen.io/api/oembed'],
	logo: 'https://codepen.io/favicon.ico',
	options: {
		codepenPrivacyPolicy: {
			title: 'Codepen Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'https://blog.codepen.io/legal/privacy/',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/(?!anon)([a-z0-9_-]+)\/(?:pen|full|details|debug)\/([a-z]+)\b/i).exec(pathname),
	async handleLink(href, [, user, hash]) {
		const { html } = await ajax({
			url: 'https://codepen.io/api/oembed',
			query: {
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
});
