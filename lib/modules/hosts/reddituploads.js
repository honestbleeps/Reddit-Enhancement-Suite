/* @flow */

import { Host } from '../../core/host';

export default new Host('reddituploads', {
	name: 'reddituploads',
	domains: ['reddituploads.com'],
	attribution: false,
	options: {
		reddituploadsPrivacyPolicy: {
			title: 'reddituploads Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: () => true,
	handleLink(href) {
		return {
			type: 'IMAGE',
			src: href,
		};
	},
});
