/* @flow */

import { Host } from '../../core/host';

export default new Host('imgflip', {
	name: 'imgflip',
	domains: ['imgflip.com'],
	logo: 'https://imgflip.com/favicon02.png',
	options: {
		imgflipPrivacyPolicy: {
			title: 'imgflip Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/(i|gif)\/([a-z0-9]+)/).exec(pathname),
	handleLink(href, [, type, id]) {
		return {
			type: 'IMAGE',
			src: `https://i.imgflip.com/${id}.${type === 'gif' ? 'gif' : 'jpg'}`,
		};
	},
});
