import { ajax } from '../../environment';
import { string } from '../../utils';

export default {
	moduleID: 'minus',
	name: 'min.us',
	logo: 'http://dgbc7tshfzi70.cloudfront.net/smedia/root/favicon11.png',
	domains: ['min.us'],
	detect: ({ href }) => (/^http:\/\/min\.us\/([\w]+)(?:#[\d+])?(?:$|\?)/i).exec(href),
	async handleLink(href, [, hash]) {
		if (!hash.startsWith('m')) { // if not 'm', not a gallery, we can't do anything with the API.
			throw new Error('min.us link is not a gallery.');
		}

		const info = await ajax({
			url: string.encode`http://min.us/api/GetItems/${hash}`,
			type: 'json',
		});

		if (!info.ITEMS_GALLERY) {
			throw new Error('No gallery items found.');
		}

		const src = info.ITEMS_GALLERY.map((src, i) => ({
			type: 'IMAGE',
			src,
			title: info.ITEMS_NAME[i],
		}));

		return {
			type: 'GALLERY',
			title: info.GALLERY_TITLE,
			src,
		};
	},
};
