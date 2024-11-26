/* @flow */

import $ from 'jquery';
import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('bluesky', {
	name: 'bluesky',
	logo: 'https://bsky.app/static/favicon.png',
	permissions: ['https://embed.bsky.app/oembed'],
	domains: ['bsky.app'],
	detect: ({ href }) => (/^^https?:\/\/(bsky)\.app\/profile\/[\w.-]+\/post+/i).exec(href),
	async handleLink(href) {
		const post = await ajax({
			url: 'https://embed.bsky.app/oembed',
			query: { url: href },
			type:'json',
		});

		// Script requires element to be attached to document when starting
		const $dummy = $('<div>');

		return {
			type: 'GENERIC_EXPANDO',
			muted: true,
			expandoClass: 'selftext',
			generate: () => $dummy[0],
			onAttach: () => { $dummy.html(post.html); },
		};
	},
}); 