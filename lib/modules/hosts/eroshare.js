/* @flow */

import { Host } from '../../core/host';

export default new Host('eroshare', {
	name: 'eroshare',
	domains: ['eroshare.com'],
	logo: '//eroshare.com/favicon.ico',
	detect: ({ pathname }) => (/^\/((?:i\/)?[a-z0-9]{8})/i).exec(pathname),
	handleLink(href, [, hash]) {
		return {
			type: 'IFRAME',
			embed: `//eroshare.com/embed/${hash}`,
			width: '550px',
			height: '550px',
			fixedRatio: true,
		};
	},
});
