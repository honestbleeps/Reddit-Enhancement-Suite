/* @flow */

import { Host } from '../../core/host';

type Detect = RegExp$matchResult;

export default new Host<Detect, {}>('adultswim', {
	name: 'Adult Swim',
	domains: ['adultswim.com'],
	logo: 'https://www.adultswim.com/favicon.ico',
	detect: ({ pathname }) => (/^\/videos\/([^\/]+\/[^\/]+)(?:\/|$)/i).exec(pathname),
	handleLink(href, detect) {
		if (!Array.isArray(detect)) {
			return Promise.reject(new Error('path not detected'));
		}

		const path = detect[1];
		return {
			type: 'IFRAME',
			embed: `https://www.adultswim.com/utilities/embed/${path}`,
			fixedRatio: true,
		};
	},
});
