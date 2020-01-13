/* @flow */

import { Host } from '../../core/host';
import { DAY, string } from '../../utils';
import { ajax } from '../../environment';

export default new Host('redgifs', {
	name: 'redgifs',
	domains: ['redgifs.com'],
	logo: 'https://redgifs.com/favicon.ico',
	detect: ({ pathname }) => (/^\/(?:(?:ifr|watch)\/)(\w+)/i).exec(pathname),
	async handleLink(href, [, id]) {
		const info = (await ajax({
			url: string.encode`https://api.redgifs.com/v1/gfycats/${id}`,
			type: 'json',
			cacheFor: DAY,
		})).gfyItem;

		return {
			type: 'VIDEO',
			frameRate: info.frameRate,
			loop: true,
			muted: !info.hasAudio,
			playbackRate: +(href.match(/[?|&]speed=([\d\.]+)/i) || [undefined, 1])[1],
			poster: info.posterUrl,
			sources: [{
				source: info.webmUrl,
				type: 'video/webm',
			}, {
				source: info.mp4Url,
				type: 'video/mp4',
			}],
			time: +(href.match(/[?|&]frameNum=([\d]+)/i) || [undefined, 0])[1] / info.frameRate,
		};
	},
});
