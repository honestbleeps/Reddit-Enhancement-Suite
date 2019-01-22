/* @flow */

import { Host } from '../../core/host';

export default new Host('getyarn', {
	name: 'getyarn.io',
	logo: 'https://getyarn.io/favicon.ico',
	domains: ['getyarn.io'],
	options: {
		getyarnPrivacyPolicy: {
			title: 'getyarn Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/\/yarn-clip\/(?:embed\/)?([\w\-]+)/i).exec(pathname),
	handleLink(href, [, code]) {
		const embed = `https://getyarn.io/yarn-clip/embed/${code}`;

		return {
			type: 'IFRAME',
			embed: `${embed}?autoplay=false`,
			embedAutoplay: `${embed}?autoplay=true`,
			height: '600px', // size as per docs in https://getyarn.io/yarn-clip/embed-test/
			width: '768px',
			fixedRatio: true,
		};
	},
});
