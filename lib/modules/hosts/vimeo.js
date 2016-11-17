/* @flow */

import { Host } from '../../core/host';

export default new Host('vimeo', {
	name: 'vimeo',
	domains: ['vimeo.com'],
	attribution: false,
	detect: ({ pathname }) => (/^\/([0-9]+)(?:\/|$)/i).exec(pathname),
	handleLink(href, [, id]) {
		const embed = `https://player.vimeo.com/video/${id}`;
		return {
			type: 'IFRAME',
			embed,
			embedAutoplay: `${embed}?autoplay=true`,
			pause: '{"method":"pause"}',
			play: '{"method":"play"}',
		};
	},
});
