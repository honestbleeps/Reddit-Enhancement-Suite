/* @flow */

import { Host } from '../../core/host';

export default new Host('ppy.sh', {
	name: 'ppy.sh',
	domains: ['osu.ppy.sh'],
	logo: 'https://s.ppy.sh/favicon.ico',
	options: {
		ppyPrivacyPolicy: {
			title: 'ppy Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/ss\/(\d+)/i).exec(pathname),
	handleLink(href, [, code]) {
		return {
			type: 'IMAGE',
			src: `https://osu.ppy.sh/ss/${code}`,
		};
	},
});
