/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';

function base58Encode(num) {
	const alpha = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
	let enc = '';
	let acc = num;

	do {
		const div = Math.floor(acc / 58);
		const mod = acc - (58 * div);
		enc = `${alpha[mod]}${enc}`;
		acc = div;
	} while (acc);

	return enc;
}

export default new Host('flickr', {
	name: 'flickr',
	domains: ['flickr.com', 'flic.kr', 'staticflickr.com'],
	permissions: ['https://www.flickr.com/services/oembed'],
	logo: 'https://s.yimg.com/pw/favicon.ico',
	detect({ origin, href, pathname }) {
		if (origin.endsWith('staticflickr.com')) {
			// these urls requires some additional processing
			const [, id] = (/(?:.+\/)?\d{4}\/(\d{10,})_/i).exec(pathname) || [];
			// encode the id and use a Flickr short-url
			if (id) return `https://flic.kr/p/${base58Encode(parseInt(id, 10))}`;
		} else {
			return href;
		}
	},
	async handleLink(href, oembedTarget) {
		const info = await ajax({
			url: 'https://www.flickr.com/services/oembed',
			query: { format: 'json', url: oembedTarget },
			type: 'json',
		});

		const validSuffix = /\.(jpg|jpeg|gif|png)/i;
		const src = validSuffix.test(oembedTarget) ? oembedTarget : // The oembed provides usually proides a ~~low resolution image, while the original link often is to the highest one
			validSuffix.test(info.url) ? info.url :
			validSuffix.test(info.thumbnail_url) ? info.thumbnail_url :
			undefined;

		if (!src) {
			throw new Error('No image found.');
		}

		return {
			type: 'IMAGE',
			title: info.title,
			credits: `Picture by: <a href="${info.author_url}">${info.author_name}</a> @ Flickr`,
			src,
		};
	},
});
