/* @flow */

import { Host } from '../../core/host';

export default new Host('strawpoll', {
	name: 'strawpoll.me',
	domains: ['strawpoll.me'],
	attribution: false,
	detect: ({ pathname }) => (/^\/(?:embed_\d\/)?(\d+)/i).exec(pathname),
	handleLink(href, [, uid]) {
		return {
			type: 'IFRAME',
			expandoClass: 'selftext',
			muted: true,
			embed: `https://www.strawpoll.me/embed_1/${uid}`,
			height: '500px',
			width: '700px',
		};
	},
});
