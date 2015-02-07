export default {
	moduleID: 'twitch',
	name: 'twitch.tv',
	domains: ['twitch.tv'],
	logo: 'https://www.twitch.tv/favicon.ico',
	detect: href => (/^https?:\/\/(?:www\.)?twitch\.tv\/(\w+)(?:\/([cbv])\/([0-9]+))?\/?(?:\?t=(?:([0-9]+)h)?(?:([0-9]+)m)?(?:([0-9]+)s)?)?$/i).exec(href),
	handleLink(href, [, channel, typeId, videoId, h, m, s]) {
		const channelOrVideo = videoId ?
			`video=${typeId.replace('b', 'a')}${videoId}` :
			`channel=${channel}`;

		const embed = `https://player.twitch.tv/?${channelOrVideo}&time=${+h || 0}h${+m || 0}m${+s || 0}s`;

		return {
			type: 'IFRAME',
			embed: `${embed}&autoplay=false`,
			embedAutoplay: `${embed}&autoplay=true`,
		};
	},
};
