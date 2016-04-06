addLibrary('mediaHosts', 'gyazo', {
	domains: ['gyazo.com'],
	logo: 'https://gyazo.com/favicon.ico',
	detect: href => (/https?:\/\/gyazo\.com\/\w{32}\b/i).test(href),
	async handleLink(elem) {
		await RESEnvironment.permissions.request('https://api.gyazo.com/api/oembed*');

		const { url } = await RESEnvironment.ajax({
			url: 'https://api.gyazo.com/api/oembed',
			data: { url: elem.href },
			type: 'json'
		});

		elem.type = 'IMAGE';
		elem.src = url;
	}
});
