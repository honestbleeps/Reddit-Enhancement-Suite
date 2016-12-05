/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('flickr', {
	name: 'flickr',
	domains: ['flickr.com', 'flic.kr'],
	logo: '//s.yimg.com/pw/favicon.ico',
	detect: ({ href }) => (
		(/^https?:\/\/(?:\w+\.)?flickr\.com\/(?:.+)\/(\d{10,})(?:\/|$)/i).test(href) ||
		(/^https?:\/\/(?:\w+\.)?flic\.kr\/p\/(\w+)(?:\/|$)/i).test(href) ||
		(/^https?:\/\/(?:\w+\.)?staticflickr\.com\/(?:.+)\/(?:\d{4,4})\/(\d{10,})_(?:.+)\.jpg/i).test(href)
	),
	async handleLink(href) {
		const staticRe = /^https?:\/\/(?:\w+\.)?staticflickr\.com\/(?:.+)\/(?:\d{4,4})\/(\d{10,})_(?:.+)\.jpg/i;
		const matches = href.match(staticRe);
		// encode a number into a base58 identifier
		const base58Encode = num => {
			if (typeof num !== 'number') {
				num = parseInt(num, 10);
			}

			const alpha = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
			let enc = '';
			let div = num;
			let mod;

			while (num >= 58) {
				div = num / 58;
				mod = num - (58 * Math.floor(div));
				enc = `${alpha.substr(mod, 1)}${enc}`;
				num = Math.floor(div);
			}

			return (div) ? `${alpha.substr(div, 1)}${enc}` : enc;
		};

		let oembedTarget = href;
		let encodedId;

		// if our href matches the `staticflickr` regular expression,
		// then encode the id we extracted and use a Flickr short-url
		// as the oembed target
		if (matches && matches.length > 0) {
			encodedId = base58Encode(matches[1]);
			oembedTarget = `https://flic.kr/p/${encodedId}`;
		}

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
