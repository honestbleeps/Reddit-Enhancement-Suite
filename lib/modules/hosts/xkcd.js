import { ajax } from 'environment';

export default {
	moduleID: 'xkcd',
	name: 'xkcd',
	domains: ['xkcd.com'],
	logo: 'https://xkcd.com/favicon.ico',
	detect: href => (/^https?:\/\/(?:www\.|m\.)?xkcd\.com\/([0-9]+)/i).exec(href),
	async handleLink(elem, [, id]) {
		// Go get data
		const data = await ajax({
			url: 'https://noembed.com/embed',
			data: { url: `http://xkcd.com/${id}/` }, // noembed doesn't believe in the HTTPS urls, so these need to be "http"
			type: 'json'
		});

		// documentFragment doesn't support innerHTML, so use div instead
		const temp = document.createElement('div');
		temp.innerHTML = data.html;
		const img = temp.querySelector('img');

		// Set attributes
		elem.type = 'IMAGE';
		elem.imageTitle = img.getAttribute('alt');
		elem.caption = img.getAttribute('title');
		elem.src = img.getAttribute('src').replace('https://noembed.com/i/', ''); // remove noembed image proxy & link direct
	}
};
