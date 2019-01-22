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
			callback: 'privacy_link_placeholder',
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
