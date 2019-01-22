/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('steamcommunity', {
	name: 'Steam Community',
	logo: 'https://store.steampowered.com/favicon.ico',
	domains: ['steamcommunity.com'],
	options: {
		steamcommunityPrivacyPolicy: {
			title: 'Steam Community Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname, searchParams }) => pathname.startsWith('/sharedfiles/filedetails') && searchParams.get('id'),
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
			data: { itemcount: '1', 'publishedfileids[0]': id },
			type: 'json',
		});

		if (!filename) throw new Error('Response missing filename. (Private Steam Community profile?)');

		return {
			type: 'IMAGE',
			title,
			caption,
			src: ['.png', '.jpg', '.gif'].some(ext => filename.endsWith(ext)) ? fileUrl : previewUrl,
		};
	},
});
