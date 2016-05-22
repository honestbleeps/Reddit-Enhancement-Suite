import { $ } from '../../vendor';
import { Permissions, ajax } from '../../environment';

export default {
	moduleID: 'twitter',
	name: 'twitter',
	domains: ['twitter.com'],
	attribution: false,
	detect: href => (/^https?:\/\/(?:mobile\.)?twitter\.com\/(?:#!\/)?[\w]+\/status(?:es)?\/([\d]+)/i).exec(href),
	async handleLink(elem, [, id]) {
		await Permissions.request('https://api.twitter.com/*');
		// we have to omit the script tag and all of the nice formatting it brings us in Firefox
		// because AMO does not permit externally hosted script tags being pulled in from
		// oEmbed like this...
		const { html } = await ajax({
			url: 'https://api.twitter.com/1/statuses/oembed.json',
			data: { id, omit_script: process.env.BUILD_TARGET === 'firefox' },
			type: 'json',
		});

		// Script requires element to be attached to document when starting
		const $dummy = $('<div>');

		return {
			type: 'GENERIC_EXPANDO',
			expandoClass: 'selftext twitter',
			generate: () => $dummy[0],
			onAttach: () => $dummy.replaceWith($(html)),
		};
	},
};
