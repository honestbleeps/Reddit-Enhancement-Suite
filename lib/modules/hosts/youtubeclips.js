/* @flow */
import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('youtubeclips', {
	name: 'youtube clips',
	attribution: false,
	// `https://youtube.com/clip/UgkxflsQSOP0_GmchSvIeAbqdHF3MzI_y2Pm`
	domains: ['youtube.com'],
	detect: ({ pathname }) => {
		// Example pathname: `/clip/UgkxflsQSOP0_GmchSvIeAbqdHF3MzI_y2Pm`
		const [clipId] = (/(?<=\/clip\/)[\w-]{36}/).exec(pathname) || [null];
		return clipId;
	},
	async handleLink(href, clipId) {
		const {iframeUrl} = await ajax({
			url: `https://youtube-clip-embed-extractor.544146.workers.dev/?clipId=${clipId}`,
			type: 'json',
		});

		const url = new URL(iframeUrl);
		url.searchParams.append('version', '3');
		url.searchParams.append('rel', '0');
		url.searchParams.append('enablejsapi', '1');

		return {
			type: 'IFRAME',
			embed: url.href,
			embedAutoplay: `${url.href}&autoplay=1`,
			pause: '{"event":"command","func":"stopVideo","args":""}',
			play: '{"event":"command","func":"playVideo","args":""}',
			fixedRatio: true,
		};
	},
});


