/* @flow */

import { Host } from '../../core/host';

export default new Host('mixer', {
	name: 'Mixer',
	domains: ['beam.pro', 'mixer.com'],
	logo: 'https://mixer.com/_latest/assets/favicons/favicon-32x32.png',
	options: {
		mixerPrivacyPolicy: {
			title: 'Mixer Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/(\w+)$/).exec(pathname),
	handleLink(href, [, clipId]) {
		const embed = `https://mixer.com/embed/player/${clipId}`;

		return {
			type: 'IFRAME',
			muted: true,
			embed,
			fixedRatio: true,
		};
	},
});
