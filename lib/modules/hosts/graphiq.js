/* @flow */

import { Host } from '../../core/host';
import { DAY } from '../../utils';
import { ajax } from '../../environment';

export default new Host('graphiq', {
	name: 'graphiq',
	domains: ['graphiq.com'],
	logo: 'https://www.graphiq.com/favicon.ico',
	landingPage: 'https://www.graphiq.com/', // set menually as https url without www didn't work when i tried it
	options: {
		graphiqPrivacyPolicy: {
			title: 'graphiq Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/(?:w|wlp|vlp)\/([A-z0-9]+)/i).exec(pathname),
	async handleLink(href, [url, id]) {
		const {
			width = '640',
			height = '360',
		} = await ajax({
			url: 'https://oembed.graphiq.com/services/oembed',
			query: { url },
			type: 'json',
			cacheFor: DAY,
		});

		return {
			type: 'IFRAME',
			expandoClass: 'selftext',
			muted: true,
			embed: `https://www.graphiq.com/w/${id}`,
			width: `${width}px`,
			height: `${height}px`,
		};
	},
});
