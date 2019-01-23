/* @flow */

import { Host } from '../../core/host';

export default new Host('twimg', {
	name: 'twimg',
	domains: ['pbs.twimg.com'],
	logo: 'https://twitter.com/favicon.ico',
	options: {
		twimgPrivacyPolicy: {
			title: 'twimg Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'https://twitter.com/privacy',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/media\/[\w\-]+\.\w+/i).test(pathname),
	handleLink(href) {
		return {
			type: 'IMAGE',
			src: href,
		};
	},
});
