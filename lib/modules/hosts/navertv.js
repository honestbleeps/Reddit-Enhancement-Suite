/* @flow */

import { Host } from '../../core/host';

export default new Host('Naver', {
	name: 'Naver',
	domains: ['tv.naver.com'],
	logo: 'https://www.naver.com/favicon.ico?1',
	detect: ({ pathname }) => (/^\/(?:v)\/([0-9]+)/i).exec(pathname),
	handleLink(href, [, id]) {
		const embed = `https://tv.naver.com/embed/${id}`;
		return {
			type: 'IFRAME',
			embed,
			embedAutoplay: `${embed}?autoPlay=true`,
			fixedRatio: true,
		};
	},
});
