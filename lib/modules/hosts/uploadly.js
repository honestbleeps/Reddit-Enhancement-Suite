/* @flow */

import { Host } from '../../core/host';

export default new Host('uploadly', {
	name: 'uploadly',
	domains: ['uploadly.com'],
	attribution: false,
	detect: ({ href }) => (/^https?:\/\/(?:www\.)?uploadly\.com\/([a-z0-9]{8}(#[a-z0-9]{8})?)/i).exec(href),
	handleLink(href, [, hash]) {
		return {
			type: 'IFRAME',
			embed: `//uploadly.com/embed/${hash}`,
			width: '550px',
			height: '550px',
		};
	},
});
