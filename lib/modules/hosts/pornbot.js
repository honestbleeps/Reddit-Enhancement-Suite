/* @flow */

import { Host } from '../../core/host';
import { DAY } from '../../utils';
import { ajax } from '../../environment';

export default new Host('pornbot', {
	name: 'pornbot',
	domains: ['pornbot.net'],
	logo: 'https://pornbot.net/favicon.ico',
	detect: ({ pathname }) => (/^\/([a-z0-9]{8,})/i).exec(pathname),
	async handleLink(href, [, hash]) {
		const info = await ajax({
			url: 'https://pornbot.net/ajax/info.php',
			query: { v: hash },
			type: 'json',
			cacheFor: DAY,
		});

		return {
			type: 'VIDEO',
			loop: true,
			muted: true,
			poster: info.poster,
			sources: [{
				source: info.mp4Url,
				type: 'video/mp4',
			}],
		};
	},
});
