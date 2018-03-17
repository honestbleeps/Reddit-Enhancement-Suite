/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('imgdjinn', {
	name: 'imgdjinn',
	domains: ['imgdjinn.com'],
	logo: 'https://imgdjinn.com/favicon.ico',
	detect: ({ pathname }) => (/^\/([ai])\/([^\/]+)$/).exec(pathname),
	async handleLink(href, [, type, id]) {
		const images = await ajax({
			url: `https://imgdjinn.com/api/${type === 'a' ? 'a/' : ''}i/${id}`,
			type: 'json',
		});
		return {
			type: 'GALLERY',
			src: images.map(i => ({
				type: 'IMAGE',
				src: i,
			})),
		};
	},
});
