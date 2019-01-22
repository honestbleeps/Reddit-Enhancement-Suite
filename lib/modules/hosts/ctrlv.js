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
			callback: 'privacy_link_placeholder',
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
