/* @flow */

import { Host } from '../../core/host';

export default new Host('rawprogress', {
	name: 'Raw progress',
	domains: [
		'rawprogress.com',
	],
	attribution: false,
	detect: ({ pathname }) => (/^\/e(?:mbed)?\/([^\/]+)/).exec(pathname),
	handleLink(href, [, id]) {
		return {
			type: 'IFRAME',
			expandoClass: 'image',
			embed: `https://rawprogress.com/embed/${id}`,
			muted: true,
			height: '700px',
			width: '800px',
		};
	},
});
