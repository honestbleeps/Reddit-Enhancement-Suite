export default {
	moduleID: 'twitchclips',
	name: 'twitch.tv clips',
	domains: ['twitch.tv'],
	logo: 'https://www.twitch.tv/favicon.ico',
	detect: href => (/^https?:\/\/(?:www\.)?twitch\.tv\/(\w+)(?:\/([cbv])\/([0-9]+))?\/?(?:\?t=(?:([0-9]+)h)?(?:([0-9]+)m)?(?:([0-9]+)s)?)?$/i).exec(href),
	handleLink(href, [, channel, typeId, videoId, h, m, s]) {
		const channelOrVideo = videoId ?
			`video=${typeId.replace('b', 'a')}${videoId}` :
			`channel=${channel}`;

		const embed = `https://clips.twitch.tv/embed?clip={CLIP_ID}`;

		return {
			type: 'IFRAME',
			embed: `${embed}&autoplay=false`,
			embedAutoplay: `${embed}&autoplay=true`,
			muted: `${embed}&muted=false`,
			unMuted: `${embed}&muted=true`,
		};
	},
};
