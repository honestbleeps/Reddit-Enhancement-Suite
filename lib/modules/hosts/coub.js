/* @flow */

import { Host } from '../../core/host';

export default new Host('coub', {

	name: 'Coub',

	domains: ['coub.com'],

	options: {
		coubPrivacyPolicy: {
			title: 'Coub Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/(?:view|embed)\/(\w+)(\.gifv)?/i).exec(pathname),

	handleLink(href, [, hash, isGifv]) {
		const src = isGifv ?
			`https://coub.com/view/${hash}.gifv?res=true` :
			`https://coub.com/embed/${hash}?autoplay=true&res=true`;

		return {
			type: 'IFRAME',
			muted: !!isGifv,
			embed: src,
			fixedRatio: true,
		};
	},
});
