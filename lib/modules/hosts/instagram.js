/* @flow */

import { Host } from '../../core/host';

export default new Host('instagram', {
	name: 'Instagram',
	domains: ['instagram.com', 'instagr.am'],
	attribution: false,
	options: {
		instagramPrivacyPolicy: {
			title: 'Instagram Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/p\/([a-z0-9_\-]{10,})(?:\/|$)/i).exec(pathname),
	handleLink: (href, [, id]) => ({
		type: 'IFRAME',
		expandoClass: 'image',
		embed: `https://instagram.com/p/${id}/embed/captioned/`,
		width: '600px',
		height: '700px',
	}),
});
