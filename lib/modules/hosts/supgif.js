/* @flow */

import { Host } from '../../core/host';

export default new Host('supgif', {
	name: 'Supgif',
	domains: ['supgif.com'],
	attribution: false,
	options: {
		supgifPrivacyPolicy: {
			title: 'Supgif Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/c\/([\w\-]+)/i).exec(pathname),
	handleLink(href, [, id]) {
		return {
			type: 'IFRAME',
			embed: `https://www.supgif.com/embed/${id}`,
			fixedRatio: true,
		};
	},
});
