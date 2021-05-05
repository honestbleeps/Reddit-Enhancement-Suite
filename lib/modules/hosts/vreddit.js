/* @flow */

import { difference, sortBy } from 'lodash-es';
import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('vreddit', {
	name: 'v.redd.it',
	domains: ['v.redd.it'],
	permissions: ['https://*.redd.it/*'],
	attribution: false,
	options: {
		forceReplaceNativeExpando: {
			title: 'showImagesForceReplaceNativeExpandoTitle',
			description: 'showImagesForceReplaceNativeExpandoDesc',
			value: false,
			type: 'boolean',
		},
		minimumVideoBandwidth: {
			title: 'showImagesVredditMinimumVideoBandwidthTitle',
			description: 'showImagesVredditMinimumVideoBandwidthDesc',
			value: '3000', // In kB/s
			type: 'text',
			advanced: true,
		},
	},
	detect: ({ pathname }) => pathname.slice(1),
	async handleLink(href, id) {
		const originalPlaylistUrl = `https://v.redd.it/${id}/DASHPlaylist.mpd`;
		const mpd = await ajax({ url: originalPlaylistUrl });
		const manifest = new DOMParser().parseFromString(mpd, 'text/xml');

		const minBandwidth = parseInt(this.options.minimumVideoBandwidth.value, 10) * 1000;
		const reps = Array.from(manifest.querySelectorAll('Representation[frameRate]'));
		const videoSourcesByBandwidth = sortBy(reps, rep => parseInt(rep.getAttribute('bandwidth'), 10))
			.reverse()
			.filter((rep, i, arr) => {
				const bandwidth = parseInt(rep.getAttribute('bandwidth'), 10);
				return rep === arr[0] || bandwidth >= minBandwidth;
			});

		// Removes unwanted entries from the from manifest
		for (const rep of difference(reps, videoSourcesByBandwidth)) rep.remove();

		// BaseURL is usually a relative URL -- it needs to be absolute since remote `mpd` file is converted to a blob
		for (const rep of manifest.querySelectorAll('Representation')) {
			const baseURLElement = rep.querySelector('BaseURL');
			baseURLElement.textContent = (new URL(baseURLElement.textContent, originalPlaylistUrl)).href;
		}

		// Audio is in a seperate stream, and requires a heavy dash dependency to add to the video
		const muted = !manifest.querySelector('AudioChannelConfiguration');

		if (!videoSourcesByBandwidth.length) throw new Error('Video has no valid sources');

		const sources = (muted && id) ?
			videoSourcesByBandwidth.map(rep => ({
				source: rep.querySelector('BaseURL').textContent,
				type: 'video/mp4',
			})) : [{
				source: URL.createObjectURL(new Blob([(new XMLSerializer()).serializeToString(manifest)], { type: 'application/dash+xml' })),
				type: 'application/dash+xml',
			}];

		return {
			type: 'VIDEO',
			loop: true,
			muted,
			sources,
		};
	},
});
