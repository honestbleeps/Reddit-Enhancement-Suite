/* @flow */

import { Host } from '../../core/host';

export default new Host('lumathon', {
	name: 'Lumathon',
	domains: ['lumathon.com', 'www.lumathon.com'],
	attribution: true,
	logo: 'https://www.lumathon.com/static/favicon.ico',
	detect: ({ pathname }) => (/^\/photo\/(.+)/i).exec(pathname),
	handleLink: (href, [, path]) => ({
		type: 'IFRAME',
		expandoClass: 'image',
		embed: `https://www.lumathon.com/embed/photo/${path}`,
		width: '640px',
		height: '640px',
	}),
});
