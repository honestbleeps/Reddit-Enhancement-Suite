/* @flow */

import { Host } from '../../core/host';

export default new Host('memegen', {
	name: 'memegen',
	domains: [
		'memegen.com',
		'memegen.de',
		'memegen.nl',
		'memegen.fr',
		'memegen.it',
		'memegen.es',
		'memegen.se',
		'memegen.pl',
	],
	logo: 'http://www.memegen.com/favicon.ico',
	options: {
		memegenPrivacyPolicy: {
			title: 'memegen Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^(\/a)?\/(?:meme|mem|mim)\/([A-Za-z0-9]+)/i).exec(pathname),
	handleLink(href, [, isAnimated, id]) {
		return {
			type: 'IMAGE',
			src: `http://${isAnimated ? 'a' : 'm'}.memegen.com/${id}.${isAnimated ? 'gif' : 'jpg'}`,
		};
	},
});
