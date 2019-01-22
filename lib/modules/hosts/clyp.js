/* @flow */

import { Host } from '../../core/host';

export default new Host('clyp', {
	name: 'clyp',
	domains: ['clyp.it'],
	logo: 'https://d2cjvbryygm0lr.cloudfront.net/favicon.ico',
	options: {
		clypPrivacyPolicy: {
			title: 'clyp Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/(playlist\/)?([A-Za-z0-9]+)/i).exec(pathname),
	handleLink(href, [, playlist, id]) {
		return {
			type: 'IFRAME',
			embed: `https://clyp.it/${playlist ? 'playlist/' : ''}${id}/widget`,
			height: '160px',
			width: '600px',
		};
	},
});
