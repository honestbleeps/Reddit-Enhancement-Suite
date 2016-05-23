import { Permissions, ajax } from '../../environment';

export default {
	moduleID: 'gyazo',
	name: 'gyazo',
	domains: ['gyazo.com'],
	logo: 'https://gyazo.com/favicon.ico',
	detect: href => (/https?:\/\/gyazo\.com\/\w{32}\b/i).test(href),
	async handleLink(href) {
		await Permissions.request('https://api.gyazo.com/api/oembed*');

		const { url } = await ajax({
			url: 'https://api.gyazo.com/api/oembed',
			data: { url: href },
			type: 'json',
		});

		return {
			type: 'IMAGE',
			src: url,
		};
	},
};
