/* @flow */

import { Host } from '../../core/host';

export default new Host('livememe', {
	name: 'livememe',
	domains: ['livememe.com'],
	logo: 'https://livememe.com/favicon.ico',
	options: {
		livememePrivacyPolicy: {
			title: 'livememe Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'https://livememe.com/privacy.php',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/(?!edit)(\w{7})(?:\/|$)/i).exec(pathname),
	handleLink(href, [, id]) {
		return {
			type: 'IMAGE',
			src: `https://e.lvme.me/${id}.jpg`,
		};
	},
});
