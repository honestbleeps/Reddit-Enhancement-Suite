/* @flow */

import { Host } from '../../core/host';
import { DAY } from '../../utils';
import { ajax } from '../../environment';

export default new Host('gifs', {
	name: 'gifs.com',
	domains: ['gifs.com', 'gifyoutube.com', 'gifyt.com'],
	logo: 'https://cdn.gifs.com/resources/favicon.png',
	options: {
		gifsPrivacyPolicy: {
			title: 'gifs Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'https://gifs.com/policies/privacy',
			type: 'button',
		},
	},
	detect: ({ href }) => (
		(/^https?:\/\/(?:beta\.|www\.)?(?:gifyoutube|gifyt)\.com\/gif\/(\w+)\.?/i).exec(href) ||
		(/^https?:\/\/share\.gifyoutube\.com\/(\w+)\.gif/i).exec(href)
	),
	async handleLink(href, [, id]) {
		const { sauce } = await ajax({
			url: `https://gifs.com/api/${id}`,
			type: 'json',
			cacheFor: DAY,
		});

		return {
			type: 'VIDEO',
			loop: true,
			fallback: `https://share.gifyoutube.com/${id}.gif`,
			muted: true,
			source: sauce,
			sources: [{
				source: `https://share.gifyoutube.com/${id}.webm`,
				type: 'video/webm',
			}, {
				source: `https://share.gifyoutube.com/${id}.mp4`,
				type: 'video/mp4',
			}],
		};
	},
});
