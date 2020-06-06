/* @flow */

import { sortBy } from 'lodash-es';
import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('vreddit', {
	name: 'v.redd.it',
	domains: ['v.redd.it'],
	permissions: ['https://v.redd.it/*/DASHPlaylist.mpd'],
	attribution: false,
	options: {
		replaceNativeExpando: {
			title: 'showImagesReplaceNativeExpandoTitle',
			description: 'showImagesReplaceNativeExpandoDesc',
			value: false,
			type: 'boolean',
		},
	},
	detect: ({ pathname }) => pathname.slice(1),
	async handleLink(href, id) {
		const mpd = await ajax({ url: `https://v.redd.it/${id}/DASHPlaylist.mpd` });
		const manifest = new DOMParser().parseFromString(mpd, 'text/xml');
		// Audio is in a seperate stream, and requires a heavy dash dependency to add to the video
		if (manifest.querySelector('AudioChannelConfiguration')) throw new Error('Audio is not supported');
		const reps = Array.from(manifest.querySelectorAll('Representation'));
		const sources = sortBy(reps, rep => parseInt(rep.getAttribute('bandwidth'), 10))
			.reverse()
			.map(rep => rep.querySelector('BaseURL'))
			.map(baseUrl => ({
				source: `https://v.redd.it/${id}/${baseUrl.textContent}`,
				type: 'video/mp4',
			}));

		return {
			type: 'VIDEO',
			loop: true,
			muted: true,
			sources,
		};
	},
});
