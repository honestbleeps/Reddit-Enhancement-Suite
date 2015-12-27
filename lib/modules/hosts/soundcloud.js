addLibrary('mediaHosts', 'soundcloud', {
	domains: ['soundcloud.com'],
	// reddit's expandos are exactly the same, so ignore posts
	detect: (href, elem) => !elem.classList.contains('title'),
	async handleLink(elem) {
		const { html } = await RESEnvironment.ajax({
			url: RESUtils.string.encode`https://soundcloud.com/oembed?url=${elem.href}&format=json&iframe=true`,
			type: 'json'
		});

		// Get src from iframe html returned
		const src = $(html).attr('src');
		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', src);
		elem.setAttribute('data-pause', '{"method":"pause"}');
		elem.setAttribute('data-play', '{"method":"play"}');

		return elem;
	}
});
