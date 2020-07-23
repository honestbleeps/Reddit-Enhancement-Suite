/* @flow */

import { difference, sortBy } from 'lodash-es';
import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('vreddit', {
	name: 'v.redd.it',
	domains: ['v.redd.it'],
	permissions: ['https://v.redd.it/*/DASHPlaylist.mpd'],
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
		const mpd = await ajax({ url: `https://v.redd.it/${id}/DASHPlaylist.mpd` });
		const manifest = new DOMParser().parseFromString(mpd, 'text/xml');

		const minBandwidth = parseInt(this.options.minimumVideoBandwidth.value, 10) * 1000;
		const reps = manifest.querySelectorAll('Representation[frameRate]');
		const videoSourcesByBandwidth = sortBy(reps, rep => parseInt(rep.getAttribute('bandwidth'), 10))
			.reverse()
			.filter((rep, i, arr) => {
				const bandwidth = parseInt(rep.getAttribute('bandwidth'), 10);
				return rep === arr[0] || bandwidth >= minBandwidth;
			});

		// Removes unwanted entries from the from manifest
		for (const rep of difference(reps, videoSourcesByBandwidth)) rep.remove();

		// Update baseURL to absolute URL
		for (const rep of manifest.querySelectorAll('Representation')) {
			const baseURLElement = rep.querySelector('BaseURL');
			baseURLElement.textContent = `https://v.redd.it/${id}/${baseURLElement.textContent}`;
		}

		// Audio is in a seperate stream, and requires a heavy dash dependency to add to the video
		const muted = !manifest.querySelector('AudioChannelConfiguration');

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
