import { DAY } from '../../utils';
import { Permissions, ajax } from '../../environment';

export default {
	moduleID: 'onedrive',
	domains: ['onedrive.live.com', '1drv.ms'],
	name: 'Microsoft OneDrive',
	detect: () => true,
	async handleLink(href) {
		await Permissions.request('*://1drv.ms/*', 'https://onedrive.live.com/*');

		if (href.includes('1drv.ms/')) {
			const response = await ajax({
				url: href,
				type: 'raw',
				cacheFor: DAY,
			});

			href = response.responseURL;
		}

		const hashRe = /(?:resid=|&id=)([a-z0-9!%]+)(?:.*&authkey=([a-z0-9%!_-]+)|)/i;
		const groups = hashRe.exec(href);

		if (!groups) throw new Error('No URL match found');

		const resId = decodeURIComponent(groups[1]);
		const authKey = decodeURIComponent(groups[2]);

		const json = await ajax({
			url: `https://api.onedrive.com/v1.0/drive/items/${resId}${authKey ? `?authKey=${authKey}` : ''}`,
			type: 'json',
			cacheFor: DAY,
		});

		if (json.error) throw new Error(`Onedrive request error: ${json.error}`);

		// The link is a folder, get its content instead.
		if (json.folder) {
			const { value: files, error } = await ajax({
				url: `https://api.onedrive.com/v1.0/drive/items/${resId}/children${authKey ? `?authKey=${authKey}` : ''}`,
				type: 'json',
				cacheFor: DAY,
			});

			if (error) throw new Error(`Onedrive request error: ${error}`);

			// Gallery

			const gallery = files.filter(({ file }) => file && file.mimeType.includes('image'));

			if (!gallery.length) throw new Error('No images in gallery.');

			if (gallery.length > 1) {
				const src = gallery.map(img => ({
					type: 'IMAGE',
					title: img.name,
					caption: img.description,
					src: img['@content.downloadUrl'],
					href: img.webUrl,
				}));

				return {
					type: 'GALLERY',
					src,
				};
			} else {
				return {
					type: 'IMAGE',
					title: gallery[0].name,
					caption: gallery[0].description,
					src: gallery[0]['@content.downloadUrl'],
				};
			}
		} else {
			const type = json.file.mimeType.substring(0, json.file.mimeType.indexOf('/'));

			switch (type) {
				case 'image':
					return {
						type: 'IMAGE',
						src: json['@content.downloadUrl'],
					};
				case 'video':
					return {
						type: 'VIDEO',
						loop: false,
						sources: [{
							source: json['@content.downloadUrl'],
							type: json.file.mimeType,
						}],
					};
				case 'audio':
					return {
						type: 'AUDIO',
						loop: false,
						sources: [{
							file: json['@content.downloadUrl'],
							type: json.file.mimeType,
						}],
					};
				default:
					throw new Error(`Invalid type: ${type}`);
			}
		}
	},
};
