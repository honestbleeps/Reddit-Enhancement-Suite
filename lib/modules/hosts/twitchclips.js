export default {
	moduleID: 'twitchclips',
	name: 'twitch.tv clips',
	domains: ['clips.twitch.tv'],
	logo: 'https://www.twitch.tv/favicon.ico',
	detect: ({ pathname }) => ((/^\/(\w+\/\w+)(?:\/|$)/).exec(pathname)),
	handleLink(href, [, clipId]) {
		const embed = `https://clips.twitch.tv/embed?clip=${clipId}`;

		return {
			type: 'IFRAME',
			embed: `${embed}&autoplay=false`,
			embedAutoplay: `${embed}&autoplay=true`,
		};
	},
};
