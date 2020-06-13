/* @flow */

import { Host } from '../../core/host';
import { DAY, string } from '../../utils';
import { ajax } from '../../environment';

export default new Host('redgifs', {
	name: 'redgifs',
	domains: ['redgifs.com'],
	logo: 'https://redgifs.com/assets/favicon.ico',
	options: {
		useMobileGfycat: {
			title: 'gfycatUseMobileGfycatTitle',
			description: 'gfycatUseMobileGfycatDesc',
			value: false,
			type: 'boolean',
		},
	},
	detect: ({ pathname }) => (/^\/(?:(?:ifr|watch)\/)(\w+)/i).exec(pathname),
	async handleLink(href, [, id]) {
		const embed = `https://redgifs.com/ifr/${id}`;
		const isMobileResolution = this.options.useMobileGfycat.value;

		// Load video width/height to show a responsive embed
		try {
			const info = (await ajax({
				url: string.encode`https://napi.redgifs.com/v1/gfycats/${id}`,
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
				type: 'VIDEO',
				frameRate: info.frameRate,
				loop: true,
				muted: !info.hasAudio,
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
