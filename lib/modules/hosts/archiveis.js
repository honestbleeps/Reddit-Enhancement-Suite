/* @flow */

import { Host } from '../../core/host';

export default new Host('archive.is', {
	name: 'archive.is',
	domains: ['archive.is'],
	logo: 'https://archive.is/favicon.ico',
	options: {
		archiveisPrivacyPolicy: {
			title: 'archive.is Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/(\w+)(?:\/|$)/i).exec(pathname),
	handleLink(href, [, code]) {
		return {
			type: 'IMAGE',
			src: `https://archive.fo/${code}/scr.png`,
		};
	},
});
