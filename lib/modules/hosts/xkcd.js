import { ajax } from '../../environment';

export default {
	moduleID: 'xkcd',
	name: 'xkcd',
	domains: ['xkcd.com'],
	logo: 'https://xkcd.com/favicon.ico',
	detect: href => (/^https?:\/\/(?:www\.|m\.)?xkcd\.com\/([0-9]+)/i).exec(href),
	async handleLink(href, [, id]) {
		// Go get data
		const data = await ajax({
			url: 'https://noembed.com/embed',
			data: { url: `http://xkcd.com/${id}/` }, // noembed doesn't believe in the HTTPS urls, so these need to be "http"
			type: 'json',
		});

		// documentFragment doesn't support innerHTML, so use div instead
		const temp = document.createElement('div');
		temp.innerHTML = data.html;
		const img = temp.querySelector('img');

		// Set attributes
		return {
			type: 'IMAGE',
			title: img.getAttribute('alt'),
			caption: img.getAttribute('title'),
			src: img.getAttribute('src').replace('https://noembed.com/i/', ''), // remove noembed image proxy & link direct
		};
	},
};
