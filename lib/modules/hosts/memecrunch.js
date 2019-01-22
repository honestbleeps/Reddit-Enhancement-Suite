/* @flow */

import { Host } from '../../core/host';

export default new Host('memecrunch', {
	name: 'memecrunch',
	domains: ['memecrunch.com'],
	logo: 'https://memecrunch.com/static/favicon.ico',
	options: {
		memecrunchPrivacyPolicy: {
			title: 'memecrunch Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/meme\/([0-9A-Z]+)\/([\w\-]+)(\/image\.(png|jpg))?/i).exec(pathname),
	handleLink(href, [, id, format]) {
		return {
			type: 'IMAGE',
			src: `https://memecrunch.com/meme/${id}/${format || 'null'}/image.png`,
		};
	},
});
