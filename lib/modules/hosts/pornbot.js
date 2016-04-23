import { DAY } from '../../utils';
import { ajax } from '../../environment';

export default {
	moduleID: 'pornbot',
	name: 'pornbot',
	domains: ['pornbot.net'],
	logo: '//pornbot.net/favicon.ico',
	detect: href => (/^https?:\/\/(?:w{3}\.)?(?:v\.)?pornbot\.net\/([a-z0-9]{8,})/i).exec(href),
	async handleLink(elem, [, hash]) {
		const info = await ajax({
			url: 'https://pornbot.net/ajax/info.php',
			data: { v: hash },
			type: 'json',
			cacheFor: DAY
		});

		elem.type = 'VIDEO';
		elem.expandoOptions = {
			autoplay: true, // PornBot always has muted or no auto, so autoplay is OK
			controls: false,
			loop: true,
			muted: true,
			poster: info.poster,
			sources: [{
				source: info.mp4Url,
				type: 'video/mp4'
			}]
		};
	}
};
