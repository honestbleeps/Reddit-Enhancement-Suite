/* @flow */

import { Host } from '../../core/host';
import { DAY, string } from '../../utils';
import { ajax } from '../../environment';

export default new Host('gfycat', {
	name: 'gfycat',
	attribution: false,
	domains: ['gfycat.com'],
	logo: 'https://gfycat.com/favicon.ico',
	detect: ({ pathname }) => (/^\/(?:gifs\/detail\/)?(\w+)(?:\.gif)?/i).exec(pathname),
	async handleLink(href, [, id], info = null) {
		info = info || (await ajax({
			url: string.encode`https://api.gfycat.com/v1test/gfycats/${id}`,
			type: 'json',
			cacheFor: DAY,
		})).gfyItem;

		const width = 600;
		const height = width * info.height / info.width;

		return {
			type: 'IFRAME',
			muted: true,
			embed: `https://gfycat.com/ifr/${id}?autoplay=0`,
			embedAutoplay: `https://gfycat.com/ifr/${id}?autoplay=1`,
			width: `${width}px`,
			height: `${height}px`,
			fixedRatio: true,
		};
	},
});
