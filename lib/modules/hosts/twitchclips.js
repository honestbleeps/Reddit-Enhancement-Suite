/* @flow */

import { Host } from '../../core/host';

export default new Host('twitchclips', {
	name: 'twitch.tv clips',
	domains: ['clips.twitch.tv'],
	logo: 'https://www.twitch.tv/favicon.ico',
	// require capital first character for old-style URLs to avoid ambiguity
	// old: /username/NameOfClip
	// new: /NameOfClip
	//      /NameOfClip/edit (bad link to private edit page, but Twitch redirects so we should handle it)
	options: {
		twitchclipsPrivacyPolicy: {
			title: 'twitchclips Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/(\w+(?:\/[A-Z]\w+)?)(?:\/|$)/).exec(pathname),
	handleLink(href, [, clipId]) {
		const embed = `https://clips.twitch.tv/embed?clip=${clipId}`;

		return {
			type: 'IFRAME',
			embed: `${embed}&autoplay=false`,
			embedAutoplay: `${embed}&autoplay=true`,
			fixedRatio: true,
		};
	},
});
