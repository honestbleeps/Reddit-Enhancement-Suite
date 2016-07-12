import _ from 'lodash';
import { ajax } from '../../environment';
import { string } from '../../utils';

export default {
	moduleID: 'minus',
	name: 'min.us',
	logo: 'http://dgbc7tshfzi70.cloudfront.net/smedia/root/favicon11.png',
	domains: ['min.us'],
	// API is only useful if the hash starts with 'm' (i.e. it's a gallery)
	detect: ({ pathname }) => (/^\/(m\w+)$/i).exec(pathname),
	async handleLink(href, [, hash]) {
		const info = await ajax({
			url: string.encode`http://min.us/api/GetItems/${hash}`,
			type: 'json',
		});

		if (!info.ITEMS_GALLERY) {
			throw new Error('No gallery items found.');
		}

		const src = _.zipWith(info.ITEMS_GALLERY, info.ITEMS_NAME, (src, title) => ({ type: 'IMAGE', src, title }));

		return {
			type: 'GALLERY',
			title: info.GALLERY_TITLE,
			src,
		};
	},
};
