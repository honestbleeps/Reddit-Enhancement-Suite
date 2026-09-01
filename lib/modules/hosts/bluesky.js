/* @flow */

import $ from 'jquery';
import DOMPurify from 'dompurify';
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
		let postElement;
		try {
			const post = await ajax({
				url: 'https://embed.bsky.app/oembed',
				query: { url: href.replace(/\/+$/, '') }, // Remove trailing slashes, as the bluesky embed app does accept it.
				type:'json',
			});
			// Sanitize and parse the embed HTML, then take the first element (removes embedded script).
			postElement = $.parseHTML(DOMPurify.sanitize(post.html))[0]
		} catch (error) {
			// If we get here, the embed API likely threw a 403, which happens when a user requests that the post is only viewed
			// by logged in users on bsky.app. There is no way to embed this post.
			postElement = document.createElement('blockquote');
			postElement.className = 'bluesky-embed';
			postElement.textContent = i18n('blueskyExpandoUserRequestedLoginToView');
		}
		// Script requires element to be attached to document when starting
		const dummy = document.createElement('div');
		return {
			type: 'GENERIC_EXPANDO',
			muted: true,
			expandoClass: 'selftext',
			generate: () => dummy,
			onAttach: () => {
				dummy.appendChild(postElement);
			},
		};
	},
},
); 