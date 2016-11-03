import { ajax } from '../../environment';

export default {
	moduleID: 'tenor',
	name: 'tenor',
	domains: ['tenor.co'],
	logo: 'https://www.tenor.co/favicon.ico',
	detect: (() => {
		const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		const alphabetMap = alphabet
			.split('')
			.reduce((obj, c, i) => {
				obj[c] = i;
				return obj;
			}, {});

		function parseViewShortId(s) {
			return s
				.split('')
				.reduce((n, c) => (n * alphabet.length) + alphabetMap[c], 0);
		}

		return ({ hostname, pathname }) => {
			if (hostname === 'tenor.co') {
				// short URL
				const pathMatch = (/^\/([a-zA-Z0-9]+)\.gif$/i).exec(pathname);
				return pathMatch && { id: parseViewShortId(pathMatch[1]) };
			} else if (hostname === 'media.tenor.co') {
				return { hostname };
			} else {
				const pathMatch = (/^\/view\/.+\-(\d+)(\.gif)?$/i).exec(pathname);
				return pathMatch && { id: pathMatch[1] };
			}
		};
	})(),
	async handleLink(href, { hostname, id }) {
		if (hostname === 'media.tenor.co') {
			// Some files on our CDN are named "raw", with no file extension,
			// so they won't load without this.
			return {
				type: 'IMAGE',
				src: href,
			};
		}

		const { results: [gif] } = await ajax({
			url: 'https://api.tenor.co/v1/gifs',
			data: { key: 'JJHDC7UK73EH', ids: id },
			type: 'json',
		});

		return {
			type: 'IMAGE',
			src: gif.media[0].gif.url,
			title: gif.h1_title,
			caption: gif.generatedcaption,
		};
	},
};
