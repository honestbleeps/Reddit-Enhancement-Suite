/* @flow */

import { Host } from '../../core/host';

export default new Host('hastebin', {
	name: 'hastebin',
	domains: ['hastebin.com'],
	attribution: false,
	options: {
		hastebinPrivacyPolicy: {
			title: 'hastebin Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/(?:raw\/)?([^\/]+)/i).exec(pathname),
	handleLink(href, [, filename]) {
		return {
			type: 'IFRAME',
			expandoClass: 'selftext',
			muted: true,
			embed: `https://hastebin.com/${filename}`,
			height: '500px',
			width: '800px',
		};
	},
});
