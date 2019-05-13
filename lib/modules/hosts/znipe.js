/* @flow */

import { Host } from '../../core/host';

export default new Host('znipe', {
	name: 'ZnipeTV',
	domains: ['beta.znipe.tv', 'www.znipe.tv'],
	logo: 'https://assets.znipe.tv/icons/favicon.jpg',
	options: {
		znipePrivacyPolicy: {
			title: 'ZnipeTV Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'https://znipe.tv/privacy',
			type: 'button',
		},
	},
	detect: ({ searchParams }) => {
		const mParam = searchParams.get('m');
		if (mParam) return ['m', mParam];

		const vParam = searchParams.get('v');
		if (vParam) return ['v', vParam];
	},
	handleLink(href, [clipType, clipId]) {
		return {
			type: 'IFRAME',
			embed: `https://beta.znipe.tv/watch?${clipType}=${clipId}`,
		};
	},
});
