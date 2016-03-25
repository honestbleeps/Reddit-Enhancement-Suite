addLibrary('mediaHosts', 'xkcd', {
	domains: ['xkcd.com'],
	logo: 'https://xkcd.com/favicon.ico',
	detect: href => (/^https?:\/\/(?:www\.|m\.)?xkcd\.com\/([0-9]+)/i).exec(href),
	async handleLink(elem, [, id]) {
		elem.type = 'IMAGE';
		elem.imageId = id;
		// On first expand, init data
		elem.onFirstExpand = this.initExpando;
	},
	async initExpando(elem) {
		const data = await RESEnvironment.ajax({
			url: 'https://noembed.com/embed',
			data: { url: `http://xkcd.com/${elem.imageId}/` }, // noembed doesn't believe in the HTTPS urls, so these need to be "http"
			type: 'json'
		});

		// documentFragment doesn't support innerHTML, so use div instead
		const temp = document.createElement('div');
		temp.innerHTML = data.html;
		const img = temp.querySelector('img');

		// Set attributes
		elem.imageTitle = img.getAttribute('alt');
		elem.caption = img.getAttribute('title');
		elem.src = img.getAttribute('src').replace('https://noembed.com/i/', ''); // remove noembed image proxy & link direct
	}
});
