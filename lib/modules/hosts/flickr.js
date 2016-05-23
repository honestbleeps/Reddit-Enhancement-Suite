import { ajax } from '../../environment';

export default {
	moduleID: 'flickr',
	name: 'flickr',
	domains: ['flickr.com', 'flic.kr'],
	logo: '//s.yimg.com/pw/favicon.ico',
	detect: ({ href }) => (
		(/^https?:\/\/(?:\w+\.)?flickr\.com\/(?:.+)\/(\d{10,})(?:\/|$)/i).test(href) ||
		(/^https?:\/\/(?:\w+\.)?flic\.kr\/p\/(\w+)(?:\/|$)/i).test(href)
	),
	async handleLink(href) {
		// noembed.com does not yet support flickr shortlink.
		// We fix this by replacing the URL as of now, when support is added this can be safely removed.
		const info = await ajax({
			url: 'https://noembed.com/embed',
			data: { url: href.replace('flic.kr', 'flickr.com') },
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
};
