import { ajax } from '../../environment';

export default {
	moduleID: 'archive.is',
	name: 'archive.is',
	domains: ['archive.is'],
	logo: 'https://archive.is/favicon.ico',
	detect: ({ href }) => (/^https?:\/\/archive.is\/([^///.#]+)/i).exec(href),
	async handleLink(href, [, code]) {
		const rawHtml = await ajax({ url: `https://archive.is/${code}/image` });
		// Extract image
		const img = (new DOMParser()).parseFromString(rawHtml, 'text/html').querySelector('#CONTENT img');

		if (!img) return false;

		return {
			type: 'IMAGE',
			src: img.src,
		};
	},
};
