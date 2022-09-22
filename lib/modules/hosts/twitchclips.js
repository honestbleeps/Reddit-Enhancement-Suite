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
		function _embeddedTwitchPlayer(clipId) {
			const embed = `https://clips.twitch.tv/embed?clip=${clipId}&parent=${location.hostname}`;
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
			data: JSON.stringify([{
				query: `query ClipInfo($slug: ID!) {
					clip(slug: $slug) {
						rawVideoQualities {
							quality
							sourceURL
						}
						thumbnailURL(width: 480, height: 272)
					}
				}`,
				variables: {
					slug: clipId,
				},
			}]),
			headers: {
				'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
			},
			type: 'json',
		});
		const rawTwitchClipMetadata = rawTwitchClipMetadataContainer[0];

		// no raw video quality available, return embedded Twitch player
		if (!Array.isArray(rawTwitchClipMetadata.data.clip.rawVideoQualities) || rawTwitchClipMetadata.data.clip.rawVideoQualities.length === 0) {
			return _embeddedTwitchPlayer(clipId);
		}

		// defaults to the highest (first) available quality
		let selectedRawVideoQuality = rawTwitchClipMetadata.data.clip.rawVideoQualities[0];
		if (this.options.rawTwitchClipQualityPreference.value === 'lowest') {
			const lastQualityIndex = rawTwitchClipMetadata.data.clip.rawVideoQualities.length - 1;
			selectedRawVideoQuality = rawTwitchClipMetadata.data.clip.rawVideoQualities[lastQualityIndex];
		}

		let sourceUrl = selectedRawVideoQuality.sourceURL;
		if (this.options.rawTwitchClipAlternativeUrlToggle.value && this.options.rawTwitchClipAlternativeUrl.value) {
			sourceUrl = sourceUrl.replace('https://clips-media-assets2.twitch.tv/raw_media/', this.options.rawTwitchClipAlternativeUrl.value);
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
