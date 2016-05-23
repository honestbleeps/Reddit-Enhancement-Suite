import { ajax } from '../../environment';

export default {
	moduleID: 'redditbooru',
	name: 'redditbooru',
	domains: ['redditbooru.com'],
	logo: 'http://redditbooru.com/favicon.ico',
	detect: href => (/^http[s]?:\/\/(?:[\w\.]+)?redditbooru\.com\/gallery\/([\w]+)(\/[\w\-]+)?/i).exec(href),
	async handleLink(href, [, id, base36]) {
		// this will only be set for base36 IDs
		if (base36) {
			id = parseInt(id, 36);
		}

		const info = await ajax({
			url: 'http://redditbooru.com/images/',
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
};
