/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('flickr', {
	name: 'flickr',
	domains: ['flickr.com', 'flic.kr', 'staticflickr.com'],
	logo: '//s.yimg.com/pw/favicon.ico',
	detect: (() => {
		const alpha = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';

		function base58Encode(num) {
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

		return ({ href }) => {
			// normal flickr.com links and flic.kr shortlinks
			if ((/^https?:\/\/(?:\w+\.)?flickr\.com\/(?:.+)\/(\d{10,})(?:\/|$)/i).test(href) ||
				(/^https?:\/\/(?:\w+\.)?flic\.kr\/p\/(\w+)(?:\/|$)/i).test(href)) {
				return href;
			}

			// direct links to staticflickr.com
			const matches = (/^https?:\/\/(?:\w+\.)?staticflickr\.com\/(?:.+\/)?\d{4}\/(\d{10,})_/i).exec(href);
			if (matches) {
				// encode the id we extracted and use a Flickr short-url
				return `https://flic.kr/p/${base58Encode(matches[1])}`;
			}
		};
	})(),
	async handleLink(href, oembedTarget) {
		const info = await ajax({
			url: 'https://noembed.com/embed',
			data: { url: oembedTarget },
			type: 'json',
		});

		if (!info.media_url) {
			throw new Error('No media_url found.');
		}

		let src;
		if ((/\.(jpg|jpeg|gif|png)/i).test(info.media_url)) {
			src = info.media_url;
		} else {
			src = info.thumbnail_url;
		}

		return {
			type: 'IMAGE',
			title: info.title,
			credits: `Picture by: <a href="${info.author_url}">${info.author_name}</a> @ Flickr`,
			src,
		};
	},
});
