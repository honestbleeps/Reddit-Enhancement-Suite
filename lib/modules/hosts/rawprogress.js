/* @flow */

import { Host } from '../../core/host';

export default new Host('rawprogress', {
	name: 'Raw progress',
	domains: [
		'rawprogress.com',
	],
	attribution: false,
	detect: ({ href }) => (/\/e(?:mbed)?\/([^\/]+)/).exec(href),
	handleLink(href, [, id]) {
		const url = `https://rawprogress.com/embed/${id}`;

		return {
			type: 'IFRAME',
			embed: url,
			height: '700px',
			width: '800px',
		};
	},
});
