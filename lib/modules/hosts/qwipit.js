/* @flow */

import { Host } from '../../core/host';

export default new Host('qwipit', {
	name: 'qwipit',
	domains: ['qwip.it'],
	attribution: false,
	options: {
		qwipitPrivacyPolicy: {
			title: 'qwipit Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'https://qwip.it/privacy',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/\w+\/(\w+)/i).exec(pathname),
	handleLink(href, [, hash]) {
		return {
			type: 'IFRAME',
			embed: `https://qwip.it/reddit/${hash}`,
			height: '375px',
			width: '485px',
			fixedRatio: true,
		};
	},
});
