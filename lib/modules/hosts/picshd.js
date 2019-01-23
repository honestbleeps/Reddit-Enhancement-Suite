/* @flow */

import { Host } from '../../core/host';

export default new Host('picshd', {
	name: 'picshd',
	domains: ['picshd.com'],
	logo: 'http://picshd.com/assets/ico/favicon.ico',
	options: {
		picshdPrivacyPolicy: {
			title: 'picshd Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'http://picshd.com/privacy-policy',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/(\w{5,})(?:\.\w+)?$/i).exec(pathname),
	handleLink(href, [, hash]) {
		return {
			type: 'IMAGE',
			src: `http://i.picshd.com/${hash}.jpg`,
		};
	},
});
