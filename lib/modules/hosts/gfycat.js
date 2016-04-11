import { ajax } from '../../environment';

addLibrary('mediaHosts', 'gfycat', {
	domains: ['gfycat.com'],
	logo: '//gfycat.com/favicon2.ico',
	detect: href => href.substring(-1) !== '+' && (/^https?:\/\/(?:[\w]+.)?gfycat\.com\/(\w+)(?:\.gif)?/i).exec(href),
	async handleLink(elem, [, id]) {
		const { gfyItem: info } = await ajax({
			url: RESUtils.string.encode`https://gfycat.com/cajax/get/${id}`,
			type: 'json',
			cacheFor: RESUtils.DAY
		});

		elem.type = 'VIDEO';
		elem.expandoOptions = {
			autoplay: true, // gfycat always has muted or no auto, so autoplay is OK
			controls: false,
			frameRate: info.frameRate,
			loop: true,
			muted: true,
			playbackRate: (elem.href.match(/[?|&]speed=([\d\.]+)/i) || [undefined, 1])[1],
			poster: `https://thumbs.gfycat.com/${info.gfyName}-poster.jpg`,
			reversable: true,
			sources: [{
				source: info.webmUrl,
				reverse: info.webmUrl.replace(/\.webm$/g, '-reverse.webm'),
				type: 'video/webm'
			}, {
				source: info.mp4Url,
				reverse: info.mp4Url.replace(/\.mp4$/g, '-reverse.mp4'),
				type: 'video/mp4'
			}],
			time: (elem.href.match(/[?|&]frameNum=([\d]+)/i) || [undefined, 0])[1] / info.frameRate
		};
	}
});
