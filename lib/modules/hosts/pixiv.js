/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';
import { getUrlParams } from '../../utils';

export default new Host('pixiv', {
	name: 'pixiv',
	domains: ['pixiv.net'],
	logo: '//www.pixiv.net/favicon.ico',
	detect: ({ pathname, search }) => pathname === '/member_illust.php' && getUrlParams(search).illust_id,
	permissions: ['https://app-api.pixiv.net/v1/illust/detail'],
	async handleLink(href, id) {
		const {
			illust: {
				title,
				caption,
				meta_single_page: { original_image_url: src },
			},
		} = await ajax({
			url: 'https://app-api.pixiv.net/v1/illust/detail',
			data: { illust_id: id },
			type: 'json',
		});

		return {
			type: 'IMAGE',
			title,
			caption,
			src,
		};
	},
});
