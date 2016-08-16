import { ajax } from '../../environment';

export default {
	moduleID: 'xkcd',
	name: 'xkcd',
	domains: ['xkcd.com'],
	logo: 'https://xkcd.com/favicon.ico',
	detect: ({ hostname, pathname }) => (
		// primarily to exclude what-if.xkcd.com
		['xkcd.com', 'www.xkcd.com'].includes(hostname) &&
		(/^\/([0-9]+)(?:\/|$)/i).exec(pathname)
	),
	async handleLink(href, [, id]) {
		const { html, title } = await ajax({
			url: 'https://noembed.com/embed',
			data: { url: `http://xkcd.com/${id}/` }, // noembed doesn't believe in the HTTPS urls, so these need to be "http"
			type: 'json',
		});

		// documentFragment doesn't support innerHTML, so use div instead
		const temp = document.createElement('div');
		temp.innerHTML = html;
		const img = temp.querySelector('img');

		return {
			type: 'IMAGE',
			title,
			caption: img.getAttribute('title'),
			src: img.getAttribute('src').replace('https://noembed.com/i/', ''), // remove noembed image proxy & link direct
		};
	},
};
