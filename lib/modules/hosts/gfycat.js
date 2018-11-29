/* @flow */

import { Host } from '../../core/host';
import { DAY, string } from '../../utils';
import { ajax } from '../../environment';

export default new Host('gfycat', {
	name: 'gfycat',
	domains: ['gfycat.com'],
	logo: 'https://gfycat.com/favicon.ico',
	options: {
		useMobileGfycat: {
			title: 'gfycatUseMobileGfycatTitle',
			description: 'gfycatUseMobileGfycatDesc',
			value: false,
			type: 'boolean',
		},
	},
	detect: ({ pathname }) => (/^\/(?:gifs\/detail\/)?(\w+)(?:\.gif)?/i).exec(pathname),
	async handleLink(href, [, id], info = null) {
		const isMobileResolution = this.options.useMobileGfycat.value;

		info = info || (await ajax({
			url: string.encode`https://api.gfycat.com/v1/gfycats/${id}`,
			type: 'json',
			cacheFor: DAY,
		})).gfyItem;

		return {
			type: 'VIDEO',
			frameRate: info.frameRate,
			loop: true,
			muted: true,
			playbackRate: +(href.match(/[?|&]speed=([\d\.]+)/i) || [undefined, 1])[1],
			poster: isMobileResolution ? info.mobilePosterUrl : info.posterUrl,
			sources: [isMobileResolution && {
				source: info.mobileUrl,
				type: 'video/mp4',
			}, {
				source: info.webmUrl,
				type: 'video/webm',
			}, {
				source: info.mp4Url,
				type: 'video/mp4',
			}].filter(x => x),
			time: +(href.match(/[?|&]frameNum=([\d]+)/i) || [undefined, 0])[1] / info.frameRate,
		};
	},
});
