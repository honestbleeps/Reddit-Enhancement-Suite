import { ajax } from '../../environment';


const _alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
const _alphabetMap = {};
_alphabet.forEach((c, i) => {
	_alphabetMap[c] = i;
});

const tenor = {
	moduleID: 'tenor',
	name: 'tenor',
	domains: ['tenor.co'],
	logo: 'https://www.tenor.co/favicon.ico',
	parseViewShortId: s => {
		s = s.split('');

		return s.reduce((n, c) => ((n * _alphabet.length) + _alphabetMap[c]), 0);
	},
	detect: ({ hostname, pathname }) => {
		if (hostname === 'tenor.co') {
			// short URL
			const pathMatch = (/^\/([a-zA-Z0-9]+)\.gif$/i).exec(pathname);
			return pathMatch && [hostname, tenor.parseViewShortId(pathMatch[1])];
		} else if (hostname === 'media.tenor.co') {
			return [hostname, pathname];
		} else {
			const pathMatch = (/^\/view\/.+\-(\d+)(\.gif)?$/i).exec(pathname);
			return pathMatch && [hostname, pathMatch[1]];
		}
	},
	async handleLink(href, [hostname, id]) {
		if (hostname === 'media.tenor.co') {
			// Some files on our CDN are named "raw", with no file extension,
			// so they won't load without this.
			return {
				type: 'IMAGE',
				src: href,
			};
		}
		const apiKey = 'JJHDC7UK73EH';
		const response = await ajax({
			url: `https://api.tenor.co/v1/gifs?ids=${id}&key=${apiKey}`,
			type: 'json',
		});

		const gif = response.results[0];

		const data = {
			type: 'IMAGE',
			src: gif.media[0].gif.url,
			title: gif.h1_title,
		};
		if (gif.generatedcaption) {
			data.caption = gif.generatedcaption;
		}
		return data;
	},
};
export default tenor;
