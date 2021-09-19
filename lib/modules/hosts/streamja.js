/* @flow */

import { Host } from '../../core/host';

export default new Host('streamja', {
	name: 'streamja',
	domains: ['streamja.com'],
	logo: 'https://streamja.com/favicon.ico',
	detect: ({ pathname }) => (/^\/([^\/]+)$/i).exec(pathname),
	handleLink(href, [, code]) {
		const embed = `https://streamja.com/embed/${code}`;
		return {
			type: 'IFRAME',
			embed,
			fixedRatio: true,
		};
	},
});
