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
		let oembedTarget = href;

		if (matches && matches.length > 0) {
			oembedTarget = `https://www.flickr.com/photo.gne?id=${matches[1]}`;
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
