import { ajax } from '../../environment';

const IMAGE = 'IMAGE';
const GALLERY = 'GALLERY';

const superstack = {
	moduleID: 'superstack',
	name: 'superstack',
	domains: ['superstack.io'],
	logo: '//superstack.io/favicon.ico',
	detect({ href }) {
		return (/^https:\/\/(?:www\.)?superstack\.io\/v\/(\w+)(?:[/#]|$)/).exec(href);
	},
	async handleLink(href, [, id]) {
		const data = await ajax({
			url: `https://superstack.io/api/v/${id}`,
			type: 'json',
		});

		if (data.error) {
			throw new Error(`Super Stack API error: ${data.error}`);
		} else if (!data.photos || data.photos.length < 1) {
			throw new Error('Super Stack API error: no photos returned');
		}

		// Check if this is a single image or an album
		if (data.photos.length === 1) {
			return {
				type: IMAGE,
				src: data.photos[0].source,
			};
		} else {
			return {
				type: GALLERY,
				title: data.albumTitle || data.photos[0].title,
				src: data.photos.map(photo => photo.source),
			};
		}
	},
};

export default superstack;
