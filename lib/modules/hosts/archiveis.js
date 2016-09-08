import { ajax } from '../../environment';

export default {
	moduleID: 'archive.is',
	name: 'archive.is',
	domains: ['archive.is'],
	logo: 'https://archive.is/favicon.icoo',
	detect: function({pathname}){
		console.log(pathname);

		return (pathname.indexOf('/') === -1);
	} //({ href }) => (/^https?:\/\/(?:fav\.me\/.*|sta\.sh.*|(?:.+\.)?deviantart\.com\/(?:art\/.*|[^#]*#\/d.*))$/i).test(href),
	async handleLink(href, [, id]) {

		/*

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
		*/
	},
};
