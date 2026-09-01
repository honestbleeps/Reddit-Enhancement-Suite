/* @flow */

import DOMPurify from 'dompurify';
import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('twitter', {
	name: 'twitter',
	domains: ['twitter.com', 'x.com'],
	permissions: ['https://publish.x.com/oembed'],
	attribution: false,
	detect: ({ href }) => (/^https?:\/\/(?:mobile\.)?(twitter|x)\.com\/(?:#!\/)?[\w]+\/status\/?[\w]+/i).exec(href.replace('x.com', 'twitter.com')),
	async handleLink(href, [url]) {
		// we have to omit the script tag and all of the nice formatting it brings us in Firefox/Chrome
		// because AMO/MV3 does not permit externally hosted script tags being pulled in from
		// oEmbed like this and MV3 prevents it with CSP...
		const { html } = await ajax({
			url: 'https://publish.x.com/oembed',
			query: { url, omit_script: true },
			type: 'json',
		});

		const dummy = document.createElement('div');

		return {
			type: 'GENERIC_EXPANDO',
			muted: true,
			expandoClass: 'selftext',
			generate: () => dummy,
			onAttach: () => { dummy.innerHTML = DOMPurify.sanitize(html); },
		};
	},
});
