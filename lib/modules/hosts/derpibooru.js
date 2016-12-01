/* @flow */

import _ from 'lodash';
import { Host } from '../../core/host';
import { ajax } from '../../environment';
import { batch, string } from '../../utils';

export default new Host('derpibooru', {
	name: 'Derpibooru',
	logo: 'https://derpibooru.org/favicon.ico',
	domains: [
		'derpibooru.org',
		'trixiebooru.org',
		'derpiboo.ru', // Deprecated. Used for old links only.
		'derpicdn.net', // direct links
	],

	detect: ({ hostname, pathname }) => (hostname === 'derpicdn.net' ?
		(/^\/img\/view\/\d+\/\d+\/\d+\/(\d+)[._]/i).exec(pathname) :
		(/^\/(?:images\/)?(\d+)$/i).exec(pathname)
	),

	handleLink: (() => {
		const fetchInfo = batch(async requests => {
			const maxDepth = 10;

			const { images } = await ajax({
				url: 'https://derpibooru.org/api/v2/images/show.json',
				data: { ids: requests.map(r => r.id).join(',') },
				type: 'json',
			});

			const responseById = _.keyBy(images, 'id');

			return requests.map(({ id, depth = 0 }: { id: string, depth?: number }) => {
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
					return fetchInfo({ id: result.duplicate_of, depth: depth + 1 });
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
		}, { size: 50 });

		return async (href, [, id]) => {
			const { image, description, source_url: source } = await fetchInfo({ id });

			return {
				type: 'IMAGE',
				src: image,
				caption: description,
				credits: source ? string.escapeHTML`Source: <a href="${source}">${source}</a>` : undefined,
			};
		};
	})(),
});
