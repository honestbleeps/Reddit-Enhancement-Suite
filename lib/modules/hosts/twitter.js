import { $ } from '../../vendor';
import { ajax, permissions } from 'environment';

addLibrary('mediaHosts', 'twitter', {
	domains: ['twitter.com'],
	attribution: false,
	detect: href => (/^https?:\/\/(?:mobile\.)?twitter\.com\/(?:#!\/)?[\w]+\/status(?:es)?\/([\d]+)/i).exec(href),
	async handleLink(elem, [, id]) {
		await permissions.request('https://api.twitter.com/*');
		// we have to omit the script tag and all of the nice formatting it brings us in Firefox
		// because AMO does not permit externally hosted script tags being pulled in from
		// oEmbed like this...
		const { html } = await ajax({
			url: 'https://api.twitter.com/1/statuses/oembed.json',
			data: { id, omit_script: process.env.BUILD_TARGET === 'firefox' },
			type: 'json'
		});

		elem.type = 'GENERIC_EXPANDO';
		elem.expandoClass = 'selftext twitter';
		elem.expandoOptions = {
			generate: () => $('<div>', { class: 'expando' }).get(0),
			media: {}
		};
		elem.onExpand = ({ wrapperDiv }) => $(wrapperDiv).find('.expando').html(html);
	}
});
