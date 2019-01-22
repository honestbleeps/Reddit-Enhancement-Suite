/* @flow */

import { Host } from '../../core/host';

export default new Host('memedad', {
	name: 'memedad',
	domains: ['memedad.com'],
	logo: 'https://memedad.com/favicon.ico',
	options: {
		memedadPrivacyPolicy: {
			title: 'memedad Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/meme\/([0-9]+)/i).exec(pathname),
	handleLink(href, [, id]) {
		return {
			type: 'IMAGE',
			src: `https://memedad.com/memes/${id}.jpg`,
		};
	},
});
