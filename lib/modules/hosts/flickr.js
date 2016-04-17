import { ajax } from 'environment';

addLibrary('mediaHosts', 'flickr', {
	domains: ['flickr.com', 'flic.kr'],
	logo: '//s.yimg.com/pw/favicon.ico',
	detect: href => (
		(/^https?:\/\/(?:\w+\.)?flickr\.com\/(?:.+)\/(\d{10,})(?:\/|$)/i).test(href) ||
		(/^https?:\/\/(?:\w+\.)?flic\.kr\/p\/(\w+)(?:\/|$)/i).test(href)
	),
	async handleLink(elem) {
		// noembed.com does not yet support flickr shortlink.
		// We fix this by replacing the URL as of now, when support is added this can be safely removed.
		const info = await ajax({
			url: 'https://noembed.com/embed',
			data: { url: elem.href.replace('flic.kr', 'flickr.com') },
			type: 'json'
		});

		if (!info.media_url) {
			throw new Error('No media_url found.');
		}

		elem.type = 'IMAGE';
		elem.imageTitle = info.title;
		elem.credits = `Picture by: <a href="${info.author_url}">${info.author_name}</a> @ Flickr`;

		if ((/\.(jpg|jpeg|gif|png)/i).test(info.media_url)) {
			elem.src = info.media_url;
		} else {
			elem.src = info.thumbnail_url;
		}
	}
});
