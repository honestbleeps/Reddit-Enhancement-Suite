/* @flow */
import {
	Host,
} from '../../core/host';
import {
	ajax,
} from '../../environment';

export default new Host('twitchclips', {
	name: 'twitch.tv clips',
	domains: ['twitch.tv'],
	logo: 'https://www.twitch.tv/favicon.ico',
	// clips.twitch.tv domain:
	// 	 require capital first character for old-style URLs to avoid ambiguity
	//   old: /username/NameOfClip
	//   new: /NameOfClip
	//        /NameOfClip/edit (bad link to private edit page, but Twitch redirects so we should handle it)
	//        /NameOfClip-aBc123dEf
	//        /NameOfClip-aBc123dEf-gHi456jKl (there are clips with more than one sets of hyphen groups)
	//        /NameOfClip-aBc123dEf--gHi456jKl- (hyphens may appear more than once, and can appear at the end)
	// (www.)twitch.tv domain:
	//   support clip name as a subcomponent of a channel URL
	//   ex: www.twitch.tv/<CHANNEL_NAME>/clip/<CLIP_NAME>
	detect: ({
		hostname,
		pathname,
	}) => hostname === 'clips.twitch.tv' ? (/^\/(\w+(?:\/[A-Z]\w+)?(?:[\-\w]*))(?:\/|$)/).exec(pathname) : (/^\/\w+\/clip\/(\w+(?:\/[A-Z]\w+)?(?:[\-\w]*))(?:\/|$)/).exec(pathname),
	options: {
		forceRawTwitchClipVideo: {
			title: 'showImagesForceRawTwitchClipTitle',
			description: 'showImagesForceRawTwitchClipDesc',
			value: false,
			type: 'boolean',
		},
		rawTwitchClipQualityPreference: {
			title: 'showImagesrawTwitchClipQualityPreferenceTitle',
			description: 'showImagesrawTwitchClipQualityPreferenceDesc',
			type: 'enum',
			value: 'highest',
			values: [{
				name: 'Highest available',
				value: 'highest',
			}, {
				name: 'Lowest available',
				value: 'lowest',
			}],
		},
		rawTwitchClipAlternativeUrlToggle: {
			title: 'showImagesRawTwitchClipAlternativeUrlToggleTitle',
			description: 'showImagesRawTwitchClipAlternativeUrlToggleDesc',
			value: false,
			type: 'boolean',
		},
		rawTwitchClipAlternativeUrl: {
			title: 'showImagesRawTwitchClipAlternativeUrlTitle',
			description: 'showImagesRawTwitchClipAlternativeUrlDesc',
			type: 'text',
			// deliberately not setting a default value as third party sites may change
			// one example to be manually configured is https://clipstream.spacex.workers.dev/clips/
			value: '',
		},
	},
	async handleLink(href, [, clipId]) {
		function _embeddedTwitchPlayer(_clipId) {
			const embed = `https://clips.twitch.tv/embed?clip=${_clipId}&parent=${location.hostname}`;
			return {
				type: 'IFRAME',
				embed: `${embed}&autoplay=false`,
				embedAutoplay: `${embed}&autoplay=true`,
				fixedRatio: true,
			};
		}

		if (!this.options.forceRawTwitchClipVideo.value) {
			return _embeddedTwitchPlayer(clipId);
		}

		const rawTwitchClipMetadataContainer = await ajax({
			method: 'POST',
			url: 'https://gql.twitch.tv/gql',
			data: JSON.stringify([
				{
					operationName: 'VideoAccessToken_Clip',
					variables: {
						slug: clipId,
					},
					extensions: {
						persistedQuery: {
							version: 1,
							sha256Hash: '36b89d2507fce29e5ca551df756d27c1cfe079e2609642b4390aa4c35796eb11',
						},
					},
				},
			]),
			headers: {
				'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
			},
			type: 'json',
		});
		const rawTwitchClipMetadata = rawTwitchClipMetadataContainer[0];

		// no raw video quality available, return embedded Twitch player
		if (!Array.isArray(rawTwitchClipMetadata.data.clip.videoQualities) ||
				rawTwitchClipMetadata.data.clip.videoQualities.length === 0) {
			return _embeddedTwitchPlayer(clipId);
		}

		// defaults to the highest (first) available quality
		let selectedRawVideoQuality = rawTwitchClipMetadata.data.clip.videoQualities[0];
		if (this.options.rawTwitchClipQualityPreference.value === 'lowest') {
			const lastQualityIndex = rawTwitchClipMetadata.data.clip.videoQualities.length - 1;
			selectedRawVideoQuality = rawTwitchClipMetadata.data.clip.videoQualities[lastQualityIndex];
		}

		let sourceUrl = selectedRawVideoQuality.sourceURL;
		if (this.options.rawTwitchClipAlternativeUrlToggle.value && this.options.rawTwitchClipAlternativeUrl.value) {
			sourceUrl = sourceUrl.replace('https://production.assets.clips.twitchcdn.net/', this.options.rawTwitchClipAlternativeUrl.value);
		} else {
			const parsedUrl = new URL(sourceUrl);
			parsedUrl.searchParams.append('sig', rawTwitchClipMetadata.data.clip.playbackAccessToken.signature);
			parsedUrl.searchParams.append('token', rawTwitchClipMetadata.data.clip.playbackAccessToken.value);
			sourceUrl = parsedUrl.href;
		}

		return {
			type: 'VIDEO',
			loop: true,
			muted: false,
			sources: [{
				source: sourceUrl,
				type: 'video/mp4',
			}],
			poster: rawTwitchClipMetadata.data.clip.thumbnailURL,
		};
	},
});
