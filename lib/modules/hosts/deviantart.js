import { ajax, permissions } from 'environment';

addLibrary('mediaHosts', 'deviantart', {
	name: 'deviantART',
	logo: 'http://i.deviantart.net/icons/da_favicon.ico',
	domains: ['deviantart.com', 'fav.me'],
	detect: href => (/^http:\/\/(?:fav\.me\/.*|(?:.+\.)?deviantart\.com\/(?:art\/.*|[^#]*#\/d.*))$/i).test(href),
	async handleLink(elem) {
		await permissions.request('https://backend.deviantart.com/oembed?url=*');

		const info = await ajax({
			url: 'https://backend.deviantart.com/oembed',
			data: { url: elem.href },
			type: 'json'
		});

		switch (info.type) {
			case 'photo':
				elem.imageTitle = info.title;
				if ((/\.(jpg|jpeg|gif|png)/i).test(info.url)) {
					elem.src = info.url;
				} else {
					elem.src = info.thumbnail_url;
				}
				// elem.credits = 'Original link: <a href="'+original_url+'">'+original_url+'</a><br>Art by: <a href="'+info.author_url+'">'+info.author_name+'</a> @ deviantART';
				elem.credits = `Art by: <a href="${info.author_url}">${info.author_name}</a> @ deviantART`;
				elem.type = 'IMAGE';
				break;
			case 'rich':
				elem.type = 'TEXT';
				elem.imageTitle = info.title;
				elem.src = info.html + ((/[^\s\.]\s*$/).test(info.html) ? '...' : '');
				elem.credits = `<a href="${elem.href}">Click here to read the full text</a> - Written By: <a href="${info.author_url}">${info.author_name}</a> @ deviantART`;
				break;
			default:
				throw new Error(`Unsupported deviantART post type: ${info.type}`);
		}
	}
});
