import _ from 'lodash';
import { ajax } from '../../environment';
import { batch } from '../../utils';

const derpibooru = {
	moduleID: 'derpibooru',
	name: 'Derpibooru',
	logo: 'https://derpibooru.org/favicon.ico',
	domains: [
		'derpibooru.org',
		'trixiebooru.org',
		'derpiboo.ru', // Deprecated. Used for old links only.
	],

	detect: ({ pathname }) => (/^\/(?:images\/)?(\d+)$/i).exec(pathname),

	fetchInfo: batch(async requests => {
		const maxDepth = 10;

		const { images } = await ajax({
			url: 'https://derpibooru.org/api/v2/images/show.json',
			data: { ids: requests.map(r => r.id).join(',') },
			type: 'json',
		});

		const responseById = _.keyBy(images, 'id');

		return requests.map(({ id, depth = 0 }) => {
			const result = responseById[id];

			if (!result) {
				// API doesn't return a result for this image for some unknown reason
				// Example: https://derpibooru.org/api/v2/images/show.json?ids=17
				return new Error('No result');
			} else if (result.duplicate_of) {
				// Duplicate image.
				// Example: https://derpibooru.org/api/v2/images/show.json?ids=975313
				if (depth > maxDepth) {
					return new Error(`Exceeded max duplicate depth: ${maxDepth}`);
				}
				return derpibooru.fetchInfo({ id: result.duplicate_of, depth: depth + 1 });
			} else if (result.image) {
				// Normal image.
				// Example: https://derpibooru.org/api/v2/images/show.json?ids=0
				return result;
			} else {
				// Deleted image, or some other error.
				// Example: https://derpibooru.org/api/v2/images/show.json?ids=898402
				return new Error('Image deleted or other error');
			}
		});
	}, { size: 50 }),

	async handleLink(href, [, id]) {
		const { image, description } = await this.fetchInfo({ id });

		return {
			type: 'IMAGE',
			src: image,
			caption: description,
		};
	},
};

export default derpibooru;
