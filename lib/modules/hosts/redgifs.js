/* @flow */

import { Host } from '../../core/host';
import { DAY, string } from '../../utils';
import { ajax } from '../../environment';

export default new Host('redgifs', {
	name: 'redgifs',
	domains: ['redgifs.com'],
	logo: 'https://redgifs.com/assets/favicon.ico',
	detect: ({ pathname }) => (/^\/(?:(?:ifr|watch)\/)(\w+)/i).exec(pathname),
	async handleLink(href, [, id]) {
		const embed = `https://redgifs.com/ifr/${id}`;

		// Load video width/height to show a responsive embed
		try {
			const info = (await ajax({
				url: string.encode`https://api.redgifs.com/v1/gfycats/${id}`,
				type: 'json',
				cacheFor: DAY,
			})).gfyItem;

			let height = info.height;
			let width = info.width;
			const ratio = width / height;
			const maxSize = 600;

			if (height > width) {
				height = Math.min(height, maxSize);
				width = parseInt(ratio * height, 10);
			} else {
				width = Math.min(width, maxSize);
				height = parseInt(width / ratio, 10);
			}

			return {
				type: 'IFRAME',
				embed: `${embed}?autoplay=0`,
				embedAutoplay: embed,
				fixedRatio: false,
				width: `${width}px`,
				height: `${height}px`,
			};
		} catch (error) { // Fallback to a fixedRatio embed
			return {
				type: 'IFRAME',
				embed: `${embed}?autoplay=0`,
				embedAutoplay: embed,
				fixedRatio: true,
			};
		}
	},
});
