/* @flow */

import { Host } from '../../core/host';

export default new Host('ridewithgps', {
	name: 'ridewithgps',
	domains: ['ridewithgps.com'],
	attribution: false,
	options: {
		ridewithgpsPrivacyPolicy: {
			title: 'ridewithgps Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/(trips|routes)\/(\d+)/i).exec(pathname),
	handleLink(href, [, type, id]) {
		return {
			type: 'IFRAME',
			embed: `https://ridewithgps.com/${type}/${id}/embed`,
		};
	},
});
