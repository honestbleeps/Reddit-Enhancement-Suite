/* @flow */

import { Host } from '../../core/host';

export default new Host('poly', {
	name: 'Poly',

	domains: [
		'poly.google.com',
	],

	// Embed already contains attribution
	attribution: false,

	detect: ({ pathname }) => (/^\/view\/([a-zA-Z0-9-]+)\/?$/i).exec(pathname),

	handleLink(href, [, id]) {
		return {
			type: 'IFRAME',
			embed: `https://poly.google.com/view/${id}/embed`,
		};
	},
});
