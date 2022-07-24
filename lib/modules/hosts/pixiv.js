/* @flow */

import { Host } from '../../core/host';

export default new Host('pixiv', {
	name: 'pixiv',
	domains: ['pixiv.net'],
	logo: 'https://www.pixiv.net/favicon.ico',
	detect: ({ pathname, search }) => (pathname === '/member_illust.php' && (/illust_id=(\d+)/).exec(search)) ||
										(/(?:\/en|^)\/artworks\/(\d+)\/?$/).exec(pathname),
	handleLink(href, [, id]) {
		return {
			type: 'IFRAME',
			expandoClass: 'image',
			muted: true,
			embed: `https://embed.pixiv.net/oembed_iframe.php?type=illust&id=${id}&size=large`,
			width: '700px',
			height: '700px',
		};
	},
});
