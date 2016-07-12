import { DAY, string } from '../../utils';
import { ajax } from '../../environment';

export default {
	moduleID: 'gfycat',
	name: 'gfycat',
	domains: ['gfycat.com'],
	logo: '//gfycat.com/favicon2.ico',
	detect: ({ pathname }) => (/^\/(\w+)(?:\.gif)?/i).exec(pathname),
	async handleLink(href, [, id], info = null) {
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
			playbackRate: (href.match(/[?|&]speed=([\d\.]+)/i) || [undefined, 1])[1],
			poster: `https://thumbs.gfycat.com/${info.gfyName}-poster.jpg`,
			reversable: true,
			sources: [{
				source: info.webmUrl,
				reverse: info.webmUrl.replace(/\.webm$/g, '-reverse.webm'),
				type: 'video/webm',
			}, {
				source: info.mp4Url,
				reverse: info.mp4Url.replace(/\.mp4$/g, '-reverse.mp4'),
				type: 'video/mp4',
			}],
			time: (href.match(/[?|&]frameNum=([\d]+)/i) || [undefined, 0])[1] / info.frameRate,
		};
	},
};
