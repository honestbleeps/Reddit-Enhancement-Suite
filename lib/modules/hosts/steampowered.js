/* @flow */

import { Host } from '../../core/host';

export default new Host('steampowered', {
	name: 'Steam',
	logo: 'https://store.steampowered.com/favicon.ico',
	domains: ['steampowered.com', 'steamusercontent.com'],
	options: {
		steampoweredPrivacyPolicy: {
			title: 'Steam Powered Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/ugc\/(\d{15,20}\/\w{40})(?:$|\/)/i).exec(pathname),
	handleLink(href, [pathname]) {
		return {
			type: 'IMAGE',
			src: `http://images.akamai.steamusercontent.com${pathname}`,
		};
	},
});
