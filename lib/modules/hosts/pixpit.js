import { ajax } from '../../environment';

export default {
	moduleID: 'pixpit',
	name: 'pixpit',
	domains: ['pixpit.com'],
	logo: 'http://pixpit.com/assets/favicon-32x32.png',
	detect: href => (/^https?:\/\/(?:www\.)?pixpit.com\/pic\/([0-9]+)/i).exec(href),
	async handleLink(href, [, id]) {
		const src = await ajax({
			url: `http://www.pixpit.com/api/v1/image/url/${id}`,
		});

		return {
			type: 'IMAGE',
			src,
		};
	},
};
