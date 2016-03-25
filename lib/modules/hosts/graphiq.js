addLibrary('mediaHosts', 'graphiq', {
	domains: ['graphiq.com'],
	logo: '//www.graphiq.com/favicon.ico', 
	landingPage: 'https://www.graphiq.com/', // set menually as https url without www didn't work when i tried it
	detect: href => (/^https?:\/\/(?:www\.|w\.)?graphiq.com\/(?:w|wlp)\/([A-z0-9]+)/i).exec(href),
	async handleLink(elem, [url, id]) {
		const data = await RESEnvironment.ajax({
			url: `https://oembed.graphiq.com/services/oembed?url=${encodeURIComponent(url)}`,
			type: 'json',
			cacheFor: RESUtils.DAY
		});

		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', `https://www.graphiq.com/w/${id}`);
		elem.setAttribute('data-width', data.width);
		elem.setAttribute('data-height', data.height);
	}
});
