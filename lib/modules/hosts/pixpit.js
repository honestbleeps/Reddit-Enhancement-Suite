/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('pixpit', {
	name: 'pixpit',
	domains: ['pixpit.com'],
	logo: 'http://pixpit.com/assets/favicon-32x32.png',
	detect: ({ pathname }) => (/^\/pic\/([0-9]+)/i).exec(pathname),
	async handleLink(href, [, id]) {
		const src = await ajax({
			url: `http://www.pixpit.com/api/v1/image/url/${id}`,
		});

		return {
			type: 'IMAGE',
			src,
		};
	},
});
