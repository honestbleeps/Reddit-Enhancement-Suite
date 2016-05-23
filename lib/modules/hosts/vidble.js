import { ajax } from '../../environment';
import { string } from '../../utils';

export default {
	moduleID: 'vidble',
	name: 'vidble',
	domains: ['vidble.com'],
	logo: '//vidble.com/assets/ico/favicon.ico',
	detect: href => (/^https?:\/\/(?:www\.)?vidble.com\/(show|album)\/([a-z0-9]+)/i).exec(href),
	async handleLink(href, [, type, hash]) {
		switch (type) {
			case 'show':
				return {
					type: 'IMAGE',
					src: `https://vidble.com/${hash}_med.jpg`,
				};
			case 'album':
				const urlObj = new URL(href);
				const { pics } = await ajax({
					url: string.encode`https://vidble.com/album/album/${hash}?json=1`,
					type: 'json',
				});

				const src = pics.map((src, i) => {
					urlObj.hash = `#pic_${i}`;
					return {
						type: 'IMAGE',
						src,
						href: urlObj.href,
					};
				});

				return {
					type: 'GALLERY',
					src,
				};
			default:
				throw new Error(`This should never happen. Invalid type: ${type}`);
		}
	},
};
