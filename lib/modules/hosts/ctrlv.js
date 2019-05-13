/* @flow */

import { Host } from '../../core/host';

export default new Host('ctrlv', {
	name: 'CtrlV.in',
	logo: 'https://ctrlv.in/favicon.ico',
	domains: ['ctrlv.in'],
	options: {
		ctrlvPrivacyPolicy: {
			title: 'CtrlV Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			// Ctrlv.in redirects to amirite.com
			callback: 'https://www.amirite.com/privacy',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/([0-9]+)/i).exec(pathname),
	handleLink(href, [, id]) {
		return {
			type: 'IMAGE',
			src: `https://img.ctrlv.in/id/${id}`,
		};
	},
});
