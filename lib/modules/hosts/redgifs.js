/* @flow */

import { Host } from '../../core/host';
import { DAY, MINUTE, string } from '../../utils';
import { ajax } from '../../environment';

export default new Host('redgifs', {
	name: 'redgifs',
	domains: ['redgifs.com'],
	permissions: ['https://api.redgifs.com/v2/*'],
	logo: 'https://redgifs.com/assets/favicon.ico',
	detect: ({ pathname }) => (/^\/(?:(?:ifr|watch|i)\/)(\w+)/i).exec(pathname),
	async handleLink(href, [, id]) {
		async function _getInfo(id, deleteCache) {
			const authUrl = string.encode`https://api.redgifs.com/v2/auth/temporary`;
			if (deleteCache === true) {
				await ajax.invalidate(authUrl);
			}
			const token = (await ajax({
				url: authUrl,
				type: 'json',
				cacheFor: MINUTE * 15,
			})).token;

			return ajax({
				url: string.encode`https://api.redgifs.com/v2/gifs/${id}`,
				type: 'json',
				cacheFor: DAY,
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
		}
		try {
			let info;
			try {
				info = await _getInfo(id);
			} catch (e) {
				info = await _getInfo(id, true);
			}
			const gif = info.gif;
			if (gif.type === 2) {
				return {
					type: 'IMAGE',
					src: gif.urls.hd,
					href,
				};
			} else if (gif.type === 1) {
				return {
					type: 'VIDEO',
					muted: !gif.hasAudio,
					credits: gif.userName,
					href,
					poster: gif.urls.poster,
					loop: true,
					time: gif.duration,
					sources: [
						{
							source: gif.urls.hd,
							type: 'video/mp4',
						},
						{
							source: gif.urls.sd,
							type: 'video/mp4',
						},
					],
				};
			}
			throw new Error(`Could not handle content type(${gif.type}), href: ${href}`);
		} catch (error) { // Fallback to a fixedRatio embed
			const embed = `https://redgifs.com/ifr/${id}`;
			return {
				type: 'IFRAME',
				embed: `${embed}?autoplay=0`,
				embedAutoplay: embed,
				fixedRatio: true,
				muted: true,
			};
		}
	},
});
