/* @flow */

import { Host } from '../../core/host';

export default new Host('codepen', {
	name: 'CodePen',
	domains: ['codepen.io'],
	attribution: false, // shown in embed
	detect: ({ pathname }) => (/^\/(?!anon)([a-z0-9_-]+)\/(?:pen|full|details|debug)\/([a-z]+)\b/i).exec(pathname),
	handleLink(href, [, user, hash]) {
		return {
			type: 'IFRAME',
			muted: true,
			height: '500px',
			width: '700px',
			expandoClass: 'selftext',
			embed: `https://codepen.io/${user}/embed/${hash}`,
		};
	},
});
