/* @flow */

import { Host } from '../../core/host';

export default new Host('streamable', {
	name: 'streamable',
	domains: ['streamable.com'],
	logo: 'https://cdn-e2.streamable.com/static/14a98f7cb1ddc5213329c039dc39cac543ba410f/img/favicon.ico',
	detect: ({ pathname }) => (/^\/(?:e\/)?(\w+)$/i).exec(pathname),
	handleLink(href, [, hash]) {
		return {
			type: 'IFRAME',
			embed: `https://streamable.com/res/${hash}`,
			pause: '{"method":"pause"}',
			play: '{"method":"play"}',
			fixedRatio: true,
		};
	},
});
