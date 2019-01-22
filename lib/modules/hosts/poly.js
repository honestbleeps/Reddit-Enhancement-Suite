/* @flow */

import { Host } from '../../core/host';

export default new Host('poly', {
	name: 'Poly',

	domains: [
		'poly.google.com',
	],

	// Embed already contains attribution
	attribution: false,

	options: {
		polyPrivacyPolicy: {
			title: 'poly Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/view\/([a-zA-Z0-9-]+)\/?$/i).exec(pathname),

	handleLink(href, [, id]) {
		return {
			type: 'IFRAME',
			embed: `https://poly.google.com/view/${id}/embed`,
		};
	},
});
