/* @flow */

import { Host } from '../../core/host';

export default new Host('masterypoints', {
	name: 'MasteryPoints',
	domains: ['masterypoints.com'],
	logo: 'https://www.masterypoints.com/favicon.ico',
	options: {
		masterypointsPrivacyPolicy: {
			title: 'MasteryPoints Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/player\/(.{3,30})\/([a-zA-Z]{0,4})\b/i).exec(pathname),
	handleLink(href, [, player, server]) {
		return {
			type: 'IFRAME',
			muted: true,
			expandoClass: 'selftext',
			embed: `https://www.masterypoints.com/oembed/player/${player}/${server}`,
			height: '600px',
			width: '600px',
		};
	},
});
