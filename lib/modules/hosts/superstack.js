import { ajax } from '../../environment';

const IMAGE = 'IMAGE';
const GALLERY = 'GALLERY';

export default {
	moduleID: 'superstack',
	name: 'superstack',
	domains: ['superstack.io'],
	logo: '//superstack.io/favicon.ico',
	detect({ pathname }) {
		return (/^\/v\/(\w+)(?:\/|$)/).exec(pathname);
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

		return {
			type: GALLERY,
			title: data.albumTitle,
			src: data.photos.map(photo => ({
				src: photo.source,
				type: IMAGE,
				title: photo.title,
				caption: photo.description,
			})),
		};
	},
};
