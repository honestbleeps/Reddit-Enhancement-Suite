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

		if (json.children.length) {
			return {
				type: 'GALLERY',
				src: json.children.map(processFile),
			};
		} else {
			return processFile(json);
		}

		function processFile({
			name,
			description,
			webUrl,
			'@content.downloadUrl': src,
			file: { mimeType },
		}) {
			const type = mimeType.slice(0, mimeType.indexOf('/'));

			switch (type) {
				case 'image':
					return {
						type: 'IMAGE',
						title: name,
						caption: description,
						src,
						href: webUrl,
					};
				case 'video':
					return {
						type: 'VIDEO',
						title: name,
						caption: description,
						loop: false,
						sources: [{
							source: src,
							type: mimeType,
						}],
					};
				case 'audio':
					return {
						type: 'AUDIO',
						loop: false,
						sources: [{
							file: src,
							type: mimeType,
						}],
					};
				default:
					throw new Error(`Invalid type: ${type}`);
			}
		}
	},
});
