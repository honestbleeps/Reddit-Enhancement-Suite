/* @flow */

import { Host } from '../../core/host';

export default new Host('xboxdvr', {
	name: 'XboxDVR',
	domains: ['xboxdvr.com'],
	logo: 'https://xboxdvr.com/assets/favicon.ico',
	options: {
		xboxdvrPrivacyPolicy: {
			title: 'XboxDVR Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'https://xboxdvr.com/privacy',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/(gamer\/[^\/]+\/\w+\/\d+)(?:\/|$)/).exec(pathname),
	handleLink(href, [, path]) {
		return {
			type: 'IFRAME',
			embed: `https://xboxdvr.com/${path}/embed`,
			fixedRatio: true,
		};
	},
});
