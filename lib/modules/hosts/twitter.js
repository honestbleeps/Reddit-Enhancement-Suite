addLibrary('mediaHosts', 'twitter', {
	domains: ['twitter.com'],
	attribution: false,
	detect: href => (/^https?:\/\/(?:mobile\.)?twitter\.com\/(?:#!\/)?[\w]+\/status(?:es)?\/([\d]+)/i).exec(href),
	async handleLink(elem, [, id]) {
		await RESEnvironment.permissions.request('https://api.twitter.com/*');
		// we have to omit the script tag and all of the nice formatting it brings us in Firefox
		// because AMO does not permit externally hosted script tags being pulled in from
		// oEmbed like this...
		const { html } = await RESEnvironment.ajax({
			url: 'https://api.twitter.com/1/statuses/oembed.json',
			data: { id, omit_script: BrowserDetect.isFirefox() },
			type: 'json'
		});

		elem.type = 'GENERIC_EXPANDO';
		elem.expandoClass = 'selftext twitter';
		elem.expandoOptions = {
			generate: () => RESUtils.createElement('div', '', 'expando'),
			media: {}
		};
		elem.onExpand = ({ wrapperDiv }) => $(wrapperDiv).find('.expando').html(html);
	}
});
