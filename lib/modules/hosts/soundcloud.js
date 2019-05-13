/* @flow */

import { Host } from '../../core/host';
import { string } from '../../utils';

export default new Host('soundcloud', {
	name: 'soundcloud',
	domains: ['soundcloud.com'],
	logo: 'https://a-v2.sndcdn.com/assets/images/sc-icons/favicon-2cadd14b.ico',
	options: {
		soundcloudPrivacyPolicy: {
			title: 'soundcloud Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'https://soundcloud.com/pages/privacy',
			type: 'button',
		},
	},
	detect: () => true,
	handleLink(href) {
		return {
			type: 'IFRAME',
			embed: string.encode`https://w.soundcloud.com/player/?url=${href}`,
			height: '166px',
			width: '700px',
			pause: '{"method":"pause"}',
			play: '{"method":"play"}',
		};
	},
});
