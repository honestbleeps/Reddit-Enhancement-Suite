/* @flow */

import { Host } from '../../core/host';

export default new Host('facebookvideo', {
	name: 'facebookvideo',
	domains: ['facebook.com'],
	attribution: false, // shown in embed
    detect: ({ pathname }) => (/^\/([a-z0-9]+)\/(?:videos)\/([0-9]+)/i).exec(pathname),
	handleLink(href, [, channel, id]) { 
		const embed = `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/${channel}/videos/${id}`;
		return {
			type: 'IFRAME',
			embed,
			fixedRatio: true,
		};
	},
});
