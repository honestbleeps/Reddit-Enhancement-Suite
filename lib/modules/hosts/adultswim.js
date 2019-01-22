/* @flow */

import { Host } from '../../core/host';

export default new Host('adultswim', {
	name: 'Adult Swim',
	domains: ['adultswim.com'],
	logo: 'https://www.adultswim.com/favicon.ico',
	options: {
		adultswimPrivacyPolicy: {
			title: 'Adult Swim Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/videos\/([^\/]+\/[^\/]+)(?:\/|$)/i).exec(pathname),
	handleLink(href, [, path]) {
		return {
			type: 'IFRAME',
			embed: `https://www.adultswim.com/utilities/embed/${path}`,
			fixedRatio: true,
		};
	},
});
