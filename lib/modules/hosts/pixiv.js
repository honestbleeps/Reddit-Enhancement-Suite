/* @flow */

import { Host } from '../../core/host';

export default new Host('pixiv', {
	name: 'pixiv',
	domains: ['pixiv.net'],
	logo: 'https://www.pixiv.net/favicon.ico',
	detect: ({ pathname, searchParams }) => pathname === '/member_illust.php' && searchParams.get('illust_id'),
	handleLink(href, id) {
		return {
			type: 'IFRAME',
			expandoClass: 'image',
			muted: true,
			embed: `https://embed.pixiv.net/embed_mk2.php?id=${id}&size=large`,
			width: '700px',
			height: '700px',
		};
	},
});
