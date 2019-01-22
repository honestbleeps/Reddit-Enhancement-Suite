/* @flow */

import { Host } from '../../core/host';

export default new Host('rawprogress', {
	name: 'Raw progress',
	domains: [
		'rawprogress.com',
	],
	attribution: false,
	options: {
		rawprogressPrivacyPolicy: {
			title: 'Raw progress Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/e(?:mbed)?\/([^\/]+)/).exec(pathname),
	handleLink(href, [, id]) {
		return {
			type: 'IFRAME',
			expandoClass: 'image',
			embed: `https://rawprogress.com/embed/${id}`,
			muted: true,
			height: '700px',
			width: '800px',
		};
	},
});
