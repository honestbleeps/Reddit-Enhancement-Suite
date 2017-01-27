/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('liveleak', {
	name: 'liveleak',
	domains: ['liveleak.com'],
	attribution: false,
	detect: ({ href }) => (/\?i=([a-zA-Z0-9_]*)/i).exec(href),
	async handleLink(href, [, id]) {
		/**
		 * As LiveLeak does not support HTTPS for now, but its CDN does, we need
		 * a workaround to get a video file directly.
		 * Once they start supporting HTTPS, we could simply embed it by typing:
		 * const embed = `https://http://www.liveleak.com/ll_embed?i=${id}`;
		 */
		const info = await ajax({
			url: `http://www.liveleak.com/view?i=${id}&use_old_player=0`,
		});
		const [, file] = info.match(/file:\s?\"(https:\/\/cdn.liveleak.com\/[^"]*)\"/);
		const embed = file;

		return {
			type: 'IFRAME',
			embed,
			fixedRatio: true,
		};
	},
});
