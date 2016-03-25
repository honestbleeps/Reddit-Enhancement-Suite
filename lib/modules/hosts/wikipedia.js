addLibrary('mediaHosts', 'wikipedia', {
	domains: ['wikipedia.org'],
	logo: 'https://en.wikipedia.org/favicon.ico',
	detect: href => (/^https?:\/\/([A-z]{2})?\.wikipedia\.org\/wiki\/(.+)/i).exec(href),
	async handleLink(elem, [, country, article]) {
		elem.type = 'TEXT';

		const data = await RESEnvironment.ajax({
			url: 'https://noembed.com/embed',
			data: { url: `http://${country}.wikipedia.org/wiki/${article}` },
			type: 'json'
		});

		// Set attributes
		elem.imageTitle = data.title;
		elem.src = data.html;
	}
});
