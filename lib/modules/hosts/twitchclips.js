/* @flow */

import { Host } from '../../core/host';

export default new Host('twitchclips', {
	name: 'twitch.tv clips',
	domains: ['twitch.tv'],
	logo: 'https://www.twitch.tv/favicon.ico',
	// clips.twitch.tv domain:
	// 	 require capital first character for old-style URLs to avoid ambiguity
	//   old: /username/NameOfClip
	//   new: /NameOfClip
	//        /NameOfClip/edit (bad link to private edit page, but Twitch redirects so we should handle it)
	// (www.)twitch.tv domain:
	//   support clip name as a subcomponent of a channel URL
	//   ex: www.twitch.tv/<CHANNEL_NAME>/clip/<CLIP_NAME>
	detect: ({ hostname, pathname }) => hostname === 'clips.twitch.tv' ? (/^\/(\w+(?:\/[A-Z]\w+)?)(?:\/|$)/).exec(pathname) : (/^\/\w+\/clip\/(\w+(?:\/[A-Z]\w+)?)(?:\/|$)/).exec(pathname),
	handleLink(href, [, clipId]) {
		const embed = `https://clips.twitch.tv/embed?clip=${clipId}&parent=${location.hostname}`;

		return {
			type: 'IFRAME',
			embed: `${embed}&autoplay=false`,
			embedAutoplay: `${embed}&autoplay=true`,
			fixedRatio: true,
		};
	},
});
