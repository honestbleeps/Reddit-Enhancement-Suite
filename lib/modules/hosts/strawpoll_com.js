/* @flow */

import { Host } from '../../core/host';

export default new Host('strawpoll.com', {
	name: 'strawpoll.com',
	domains: ['strawpoll.com'],
	attribution: false,
	detect: ({ pathname }) => (/^\/(?:embed\/)?([a-z0-9]+)/i).exec(pathname),
	handleLink(href, [, id]) {
		return {
			type: 'IFRAME',
			expandoClass: 'selftext',
			muted: true,
			embed: `https://www.strawpoll.com/embed/${id}`,
			height: '450px',
			width: '700px',
		};
	},
});
