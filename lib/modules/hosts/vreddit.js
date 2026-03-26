/* @flow */

import { difference, sortBy } from 'lodash-es';
import { Host } from '../../core/host';
import { ajax } from '../../environment';
import { getPostMetadata } from '../../utils';
import { getPostCaption } from './vredditCaption.js';
import {
	buildSafariHlsVideoSources,
	buildVredditVideoSources,
	getVredditPlaylistUrls,
} from './vredditSource.js';

const DASH_PLAYLIST_TIMEOUT_MS = 2500;
const HLS_CHECK_TIMEOUT_MS = 1500;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
	let timeoutId;
	const timeout = new Promise((_, reject) => {
		timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
	});

	return Promise.race([promise, timeout]).finally(() => {
		if (timeoutId) clearTimeout(timeoutId);
	});
}

async function isSafariHlsAvailable(hlsPlaylistUrl: string): Promise<boolean> {
	if (process.env.BUILD_TARGET !== 'safari') return false;

	try {
		await withTimeout(
			ajax({ url: hlsPlaylistUrl, type: 'raw' }),
			HLS_CHECK_TIMEOUT_MS,
			'Timed out while checking the v.redd.it HLS playlist.',
		);
		return true;
	} catch (error) {
		return false;
	}
}

export default new Host('vreddit', {
	name: 'v.redd.it',
	domains: ['v.redd.it'],
	permissions: process.env.BUILD_TARGET === 'safari' ? [] : ['https://*.redd.it/*'],
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
	detect({ pathname }, thing) { return thing && { fullname: thing.getFullname(), id: pathname.slice(1) }; },
	async handleLink(href, { fullname, id }) {
		const captionPromise = getPostCaption(fullname, getPostMetadata);
		const { dash: originalPlaylistUrl, hls: hlsPlaylistUrl } = getVredditPlaylistUrls(id);
		const isSafari = process.env.BUILD_TARGET === 'safari';

		if (isSafari) {
			const hlsAvailable = await isSafariHlsAvailable(hlsPlaylistUrl);
			if (hlsAvailable) {
				return {
					type: 'VIDEO',
					loop: true,
					caption: await captionPromise,
					...buildSafariHlsVideoSources(hlsPlaylistUrl),
				};
			}
		}

		const mpd = await withTimeout(
			ajax({ url: originalPlaylistUrl }),
			DASH_PLAYLIST_TIMEOUT_MS,
			'Timed out while loading the v.redd.it DASH playlist.',
		);
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

		const hasAudio = Boolean(manifest.querySelector('AudioChannelConfiguration'));
		const hlsAvailable = hasAudio && isSafari ? await isSafariHlsAvailable(hlsPlaylistUrl) : false;

		if (!videoSourcesByBandwidth.length && !hlsAvailable) throw new Error('Video has no valid sources');

		const { muted, sources } = buildVredditVideoSources({
			buildTarget: process.env.BUILD_TARGET,
			dashManifest: (new XMLSerializer()).serializeToString(manifest),
			hasAudio,
			hlsAvailable,
			id,
			mp4Sources: videoSourcesByBandwidth.map(rep => rep.querySelector('BaseURL').textContent),
		});

		return {
			type: 'VIDEO',
			loop: true,
			caption: await captionPromise,
			muted,
			sources,
		};
	},
});
