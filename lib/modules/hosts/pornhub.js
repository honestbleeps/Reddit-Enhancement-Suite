/* @flow */

import { Host } from '../../core/host';

export default new Host('pornhub', {
	name: 'Pornhub',

	domains: [
		'www.pornhub.com',
		'www.pornhubpremium.com',
	],
	attribution: false,
	detect: ({ searchParams }) => {
		if (searchParams.has('viewkey')) return [searchParams.get('viewkey'), searchParams];
	},
	handleLink(href, [path, id]) {
		console.log('pornhub!', href, id);
		const url = new URL(`https://www.pornhub.com/embed/${path}`);

		return {
			type: 'IFRAME',
			embed: url.href,
			embedAutoplay: `${url.href}?autoplay=1`,
			fixedRatio: true,
		};
	},
});
