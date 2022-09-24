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
		const youtubeResponseBody = await ajax({
			url: `https://web.scraper.workers.dev/?url=https://www.youtube.com/clip/${clipId}&selector=body`,
			type: 'json',
		});

		const [ytInitialPlayerResponse] = youtubeResponseBody.result.body[0].match(/(?<=var ytInitialPlayerResponse = ).*?}(?=;)/);
		const { microformat: { playerMicroformatRenderer: { embed: { iframeUrl } } } } = JSON.parse(ytInitialPlayerResponse);

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


