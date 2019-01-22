/* @flow */

import { Host } from '../../core/host';

export default new Host('redditmedia', {
	name: 'redditmedia',
	domains: ['redditmedia.com'],
	attribution: false,
	options: {
		redditmediaPrivacyPolicy: {
			title: 'redditmedia Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ hostname, searchParams }) => hostname !== 'pixel.redditmedia.com' && searchParams,
	handleLink(href, searchParams) {
		if (searchParams.get('fm') === 'mp4') {
			return {
				type: 'VIDEO',
				loop: true,
				muted: true,
				sources: [{
					source: href,
					type: 'video/mp4',
				}],
			};
		}

		return {
			type: 'IMAGE',
			src: href,
		};
	},
});
