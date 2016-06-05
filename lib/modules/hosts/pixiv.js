/* @flow */

import { getUrlParams } from '../../utils';
import { Host } from '../../core/host';

export default new Host('pixiv', {
	name: 'pixiv',
	domains: ['pixiv.net'],
	logo: '//www.pixiv.net/favicon.ico',
	detect: ({ pathname, search }) => pathname === '/member_illust.php' && getUrlParams(search).illust_id,
	handleLink(href, id) {
		return {
			type: 'IFRAME',
			expandoClass: 'image',
			embed: `https://embed.pixiv.net/embed_mk2.php?id=${id}&size=large&border=off`,
			muted: true,
		};
	},
});
