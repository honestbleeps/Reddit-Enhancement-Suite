/* @flow */

import $ from 'jquery';
import { Host } from '../../core/host';
import { ajax, i18n } from '../../environment';

export default new Host('bluesky', {
	name: 'bluesky',
	logo: 'https://bsky.app/static/favicon.png',
	permissions: ['https://embed.bsky.app/oembed'],
	domains: ['bsky.app'],
	detect: ({ href }) => (/^^https?:\/\/(bsky)\.app\/profile\/[^\\]+\/post+/i).exec(href),
	options:{
		forceReplaceNativeExpando: {
			title: 'showImagesForceReplaceNativeExpandoTitle',
			description: 'showImagesForceReplaceNativeExpandoDesc',
			value: true,
			type: 'boolean',
			noconfig: true,
		},
	},
	async handleLink(href) {
		let posthtml;
		try {
			const post = await ajax({
				url: 'https://embed.bsky.app/oembed',
				query: { url: href.replace(/\/+$/, '') }, // Remove trailing slashes, as the bluesky embed app does accept it.
				type:'json',
			});
			// This removes the embedded script that we cannot use for security reasons.
			posthtml = $.parseHTML(post.html)[0]
		} catch (error) {
			// If we get here, the embed API likely threw a 403, which happens when a user requests that the post is only viewed
			// by logged in users on bsky.app. There is no way to embed this post.
			posthtml = `<blockquote class="bluesky-embed">${ i18n('blueskyExpandoUserRequestedLoginToView') }</blockquote>`
		}
		// Script requires element to be attached to document when starting
		const $dummy = $('<div>');
		return {
			type: 'GENERIC_EXPANDO',
			muted: true,
			expandoClass: 'selftext',
			generate: () => $dummy[0],
			onAttach: () => { 
				$dummy.html(posthtml);
			},
		};
	},
},
); 