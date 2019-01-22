/* @flow */

import { Host } from '../../core/host';

export default new Host('bime', {
	name: 'Bime Analytics Dashboards',
	domains: ['bime.io'],
	logo: 'https://a.bime.io/assets/favicons/favicon.ico',
	options: {
		bimePrivacyPolicy: {
			title: 'Bime Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ href }) => (/https?:\/\/([^.]+)\.bime\.io(?:\/([a-z0-9_-]+))+/i).exec(href),
	handleLink: (href, [, user, dashboardId]) => ({
		type: 'IFRAME',
		embed: `https://${user}.bime.io/dashboard/${dashboardId}`,
		expandoClass: 'selftext',
		width: '960px',
		height: '540px',
	}),
});
