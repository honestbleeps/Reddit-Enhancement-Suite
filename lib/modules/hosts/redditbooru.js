/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('redditbooru', {
	name: 'redditbooru',
	domains: ['redditbooru.com'],
	logo: 'http://redditbooru.com/favicon.ico',
	detect: ({ pathname }) => (/^\/gallery\/([\w]+)(\/[\w\-]+)?/i).exec(pathname),
	async handleLink(href, [, id, base36]) {
		// this will only be set for base36 IDs
		if (base36) {
			id = parseInt(id, 36);
		}

		const info = await ajax({
			url: 'https://redditbooru.com/images/',
			data: { postId: id },
			type: 'json',
		});

		if (!info.length) {
			throw new Error('Gallery was empty.');
		}

		const src = info.map(({ caption, cdnUrl, sourceUrl }) => ({
			type: 'IMAGE',
			title: caption,
			src: cdnUrl,
			caption: sourceUrl ? `Source: <a href="${sourceUrl}">${sourceUrl}</a>` : '',
		}));

		return {
			type: 'GALLERY',
			title: info[0].title,
			src,
		};
	},
});
