/* @flow */

import { Host } from '../../core/host';

export default new Host('vlipsy', {
	name: 'Vlipsy',
	domains: ['vlipsy.com'],
	logo: 'https://vlipsy.com/favicon.ico',
	detect: ({ pathname }) => (/^\/vlip\/(?:\w+-)*(\w+)$/).exec(pathname),
	handleLink(href, [, id]) {
		return {
			type: 'IFRAME',
			embed: `https://vlipsy.com/embed/${id}`,
			fixedRatio: true,
		};
	},
});
