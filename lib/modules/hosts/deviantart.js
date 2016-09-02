import { ajax } from '../../environment';

export default {
	moduleID: 'deviantart',
	name: 'deviantART',
	logo: 'http://i.deviantart.net/icons/da_favicon.ico',
	domains: ['deviantart.com', 'fav.me', 'sta.sh'],
	permissions: ['https://backend.deviantart.com/oembed?url=*'],
	detect: ({ href }) => (/^https?:\/\/(?:fav\.me\/.*|sta\.sh.*|(?:.+\.)?deviantart\.com\/(?:art\/.*|[^#]*#\/d.*))$/i).test(href),
	async handleLink(href) {
		const info = await ajax({
			url: 'https://backend.deviantart.com/oembed',
			data: { url: href },
			type: 'json',
		});

		switch (info.type) {
			case 'photo':
				let src;
				if ((/\.(jpg|jpeg|gif|png)/i).test(info.url)) {
					src = info.url;
				} else {
					src = info.thumbnail_url;
				}

				return {
					type: 'IMAGE',
					title: info.title,
					credits: `Art by: <a href="${info.author_url}">${info.author_name}</a> @ deviantART`,
					src,
				};
			case 'rich':
				return {
					type: 'TEXT',
					title: info.title,
					src: info.html + ((/[^\s\.]\s*$/).test(info.html) ? '...' : ''),
					credits: `<a href="${href}">Click here to read the full text</a> - Written By: <a href="${info.author_url}">${info.author_name}</a> @ deviantART`,
				};
			default:
				throw new Error(`Unsupported deviantART post type: ${info.type}`);
		}
	},
};
