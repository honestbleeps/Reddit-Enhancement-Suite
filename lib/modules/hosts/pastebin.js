/* @flow */

import { Host } from '../../core/host';

export default new Host('pastebin', {
	name: 'pastebin',
	domains: ['pastebin.com'],
	attribution: false,
	options: {
		pastebinPrivacyPolicy: {
			title: 'pastebin Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'https://pastebin.com/doc_privacy_statement',
			type: 'button',
		},
	},
	detect: ({ href }) => (/^https?:\/\/(?:www\.)?pastebin\.com\/(?:raw\.php\?i=|index\/)?([a-z0-9]{8})/i).exec(href),
	handleLink(href, [, id]) {
		return {
			type: 'IFRAME',
			expandoClass: 'selftext',
			muted: true,
			embed: `https://pastebin.com/embed_iframe.php?i=${id}`,
			height: '500px',
			width: '700px',
		};
	},
});
