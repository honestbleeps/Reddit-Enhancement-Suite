/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('example', {
	name: 'Example Media Host',

	domains: [
		'example.com', // any subdomain of `example.com`
		'www.example.org', // only the `www` subdomain of `example.org`
	],

	// Optional logo, for showing site attribution on the content
	logo: 'https://example.com/favicon.ico',
	// OR, if the embed has its own attribution (watermark, etc.), disable RES' attribution
	attribution: false,

	// Executed if the domain matches.
	// Returns truthy/falsy to indicate whether the siteModule will attempt to handle the link.
	// Called with a URL object.
	detect: ({ pathname }) => (/^\/(\d+)/i).exec(pathname),

	// Called with the link's href and the value returned from detect() (if it's truthy).
	// May throw an error if the link cannot be handled.
	// May be async if necessary.
	async handleLink(href, [, id]) {
		const { title, url } = await ajax({
			url: `https://example.com/api/${id}.json`,
			type: 'json',
		});

		// See the bottom of /lib/core/host.js or other hosts in /lib/modules/hosts
		// for the different kinds of expandos.
		return {
			type: 'IMAGE',
			title,
			src: url,
		};
	},
});
