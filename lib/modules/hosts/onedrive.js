/* @flow */

import { Host } from '../../core/host';
import { DAY } from '../../utils';
import { ajax } from '../../environment';

export default new Host('onedrive', {
	domains: ['onedrive.live.com', '1drv.ms'],
	permissions: ['https://1drv.ms/*', 'https://onedrive.live.com/*'],
	name: 'Microsoft OneDrive',
	detect: () => true,
	async handleLink(href) {
		if (href.includes('1drv.ms/')) {
			href = await ajax({
				url: href.replace('http:', 'https:'),
				type: 'redirect',
				cacheFor: DAY,
			});
		}

		// Encode the URL in base64 then convert it to unpadded base64url format
		// https://dev.onedrive.com/shares/shares.htm
		const encodedUrl = `u!${btoa(href)}`
			.replace(/=+$/g, '')
			.replace(/\//g, '_')
			.replace(/\+/g, '-');

		const json = await ajax({
			url: `https://api.onedrive.com/v1.0/shares/${encodedUrl}/root?expand=children`,
			type: 'json',
			cacheFor: DAY,
		});

		if (json.error) throw new Error(`Onedrive request error: ${json.error}`);

		// The link is a folder, get its content instead.
		if (json.folder) {
			const { value: files, error } = await ajax({
				url: `https://api.onedrive.com/v1.0/shares/${encodedUrl}/root?expand=children`,
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
});
