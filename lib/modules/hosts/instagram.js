/* @flow */

import { Host } from '../../core/host';

export default new Host('instagram', {
	name: 'Instagram',
	domains: ['instagram.com', 'instagr.am'],
	attribution: false,
	detect: ({ pathname }) => (/^\/p\/([a-z0-9_\-]{10,})(?:\/|$)/i).exec(pathname),
	handleLink: (href, [, id]) => ({
		type: 'IFRAME',
		expandoClass: 'image',
		embed: `https://instagram.com/p/${id}/embed`,
		width: '600px',
		height: '680px',
	}),
});
