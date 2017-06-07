/* @flow */

import { Host } from '../../core/host';

export default new Host('adultswim', {
	name: 'Adult Swim',
	domains: ['adultswim.com'],
	logo: 'http://www.adultswim.com/favicon.ico',
	detect: ({ href }) => (/^(?:https?)?:\/\/(?:(?:www)\.)?adultswim.com[\w\-\/:#]+videos\/([\S]+)/i).exec(href),
	handleLink(href, [, hash]) {
		const embed = `https://www.adultswim.com/utilities/embed/${hash}`;

		return {
			type: 'IFRAME',
			embed,
			embedAutoplay: `${embed}?autoplay=1`,
			pause: 'pause',
			play: 'play',
			fixedRatio: true,
		};
	},
});
