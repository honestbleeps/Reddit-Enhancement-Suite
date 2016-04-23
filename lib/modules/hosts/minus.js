import { ajax } from '../../environment';
import { string } from '../../utils';

export default {
	moduleID: 'minus',
	name: 'min.us',
	logo: 'http://dgbc7tshfzi70.cloudfront.net/smedia/root/favicon11.png',
	domains: ['min.us'],
	detect: href => (/^http:\/\/min\.us\/([\w]+)(?:#[\d+])?(?:$|\?)/i).exec(href),
	async handleLink(elem, [, hash]) {
		if (hash.substr(0, 1) !== 'm') { // if not 'm', not a gallery, we can't do anything with the API.
			throw new Error('min.us link is not a gallery.');
		}

		const info = await ajax({
			url: string.encode`http://min.us/api/GetItems/${hash}`,
			type: 'json'
		});

		if (!info.ITEMS_GALLERY) {
			throw new Error('No gallery items found.');
		}

		elem.type = 'GALLERY';
		elem.imageTitle = info.GALLERY_TITLE;
		elem.src = info.ITEMS_GALLERY.map((src, i) => ({
			src,
			title: info.ITEMS_NAME[i]
		}));
	}
};
