/* @flow */

import { Host } from '../../core/host';
import { DAY, string } from '../../utils';
import { ajax } from '../../environment';

export default new Host('gfycat', {
	name: 'gfycat',
	domains: ['gfycat.com'],
	logo: 'https://gfycat.com/favicon2.ico',
	options: {
		useMobileGfycat: {
			title: 'gfycatUseMobileGfycatTitle',
			description: 'gfycatUseMobileGfycatDesc',
			value: false,
			type: 'boolean',
		},
	},
	detect: ({ pathname }) => (/^\/(\w+)(?:\.gif)?/i).exec(pathname),
	async handleLink(href, [, id], info = null) {
		const isMobileResolution = this.options.useMobileGfycat.value;

		info = info || (await ajax({
			url: string.encode`https://gfycat.com/cajax/get/${id}`,
			type: 'json',
			cacheFor: DAY,
		})).gfyItem;

		return {
			type: 'VIDEO',
			controls: false,
			frameRate: info.frameRate,
			loop: true,
			muted: true,
			playbackRate: +(href.match(/[?|&]speed=([\d\.]+)/i) || [undefined, 1])[1],
			poster: isMobileResolution ? info.mobilePosterUrl : info.posterUrl,
			reversable: true,
			reversed: href.includes('direction=reverse'),
			sources: [isMobileResolution && {
				source: info.mobileUrl,
				reverse: info.mobileUrl.replace(/\.mp4$/g, '-reverse.mp4'),
				type: 'video/mp4',
			}, {
				source: info.webmUrl,
				reverse: info.webmUrl.replace(/\.webm$/g, '-reverse.webm'),
				type: 'video/webm',
			}, {
				source: info.mp4Url,
				reverse: info.mp4Url.replace(/\.mp4$/g, '-reverse.mp4'),
				type: 'video/mp4',
			}].filter(x => x),
			time: +(href.match(/[?|&]frameNum=([\d]+)/i) || [undefined, 0])[1] / info.frameRate,
		};
	},
});
