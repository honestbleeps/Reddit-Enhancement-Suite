/* @flow */

import { Host } from '../../core/host';

export default new Host('liveleak', {
	name: 'LiveLeak',
	domains: ['liveleak.com'],
	logo: 'https://www.liveleak.com/favicon.ico',
	detect: ({ pathname, search }) => (pathname === '/view' && search),
	handleLink: (href, query) => ({
		type: 'IFRAME',
		embed: `https://www.liveleak.com/ll_embed${query}`,
		embedAutoplay: `https://www.liveleak.com/ll_embed${query}&autostart=true`,
		fixedRatio: true,
	}),
});
