/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';
import { getUrlParams } from '../../utils';

export default new Host('steamcommunity', {
	name: 'Steam Community',
	logo: 'https://store.steampowered.com/favicon.ico',
	domains: ['steamcommunity.com'],
	detect: ({ pathname, search }) => pathname.startsWith('/sharedfiles/filedetails') && getUrlParams(search).id,
	permissions: ['https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/*'],
	async handleLink(href, id) {
		const {
			response: {
				publishedfiledetails: [{
					title,
					description: caption,
					preview_url: previewUrl,
					file_url: fileUrl,
					filename,
				}],
			},
		} = await ajax({
			method: 'POST',
			url: 'https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v0001/?format=json',
			data: { itemcount: 1, 'publishedfileids[0]': id },
			type: 'json',
		});

		return {
			type: 'IMAGE',
			title,
			caption,
			src: ['.png', '.jpg', '.gif'].some(ext => filename.endsWith(ext)) ? fileUrl : previewUrl,
		};
	},
});
