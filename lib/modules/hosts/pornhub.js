/* @flow */

import { Host } from '../../core/host';

export default new Host('pornhub', {
	name: 'Pornhub',
	domains: [
		'www.pornhub.com',
		'www.pornhubpremium.com',
	],
	attribution: false,
	options: {
		pornhubPrivacyPolicy: {
			title: 'Pornhub Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'https://www.pornhub.com/information#privacy',
			type: 'button',
		},
	},
	detect: ({ searchParams }) => searchParams.get('viewkey'),
	handleLink(href, path) {
		const url = `https://www.pornhub.com/embed/${path}`;

		return {
			type: 'IFRAME',
			embed: url,
			embedAutoplay: `${url}?autoplay=1`,
			fixedRatio: true,
		};
	},
});
