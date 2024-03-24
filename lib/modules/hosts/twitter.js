/* @flow */

import $ from 'jquery';
import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('twitter', {
	name: 'twitter',
	domains: ['twitter.com'],
	permissions: ['https://publish.twitter.com/oembed'],
	attribution: false,
	detect: ({ href }) => (/^https?:\/\/(?:mobile\.)?twitter\.com\/(?:#!\/)?[\w]+\/status\/?[\w]+/i).exec(href),
	async handleLink(href, [url]) {
		// we have to omit the script tag and all of the nice formatting it brings us in Firefox/Chrome
		// because AMO does not permit externally hosted script tags being pulled in from
		// oEmbed like this and MV3 prevents it with CSP...
		const { html } = await ajax({
			url: 'https://publish.twitter.com/oembed',
			query: { url, omit_script: true },
			type: 'json',
		});

		// Script requires element to be attached to document when starting
		const $dummy = $('<div>');

		return {
			type: 'GENERIC_EXPANDO',
			muted: true,
			expandoClass: 'selftext',
			generate: () => $dummy[0],
			onAttach: () => { $dummy.html(html); },
		};
	},
});
