addLibrary('mediaHosts', 'vidble', {
	domains: ['vidble.com'],
	detect: () => true,
	async handleLink(elem) {
		const hashRe = /^https?:\/\/(?:www\.)?vidble.com\/show\/([a-z0-9]+)/i;
		const albumHashRe = /^https?:\/\/(?:www\.)?vidble.com\/album\/([a-z0-9]+)/i;
		const groups = hashRe.exec(elem.href);

		if (groups) {
			elem.type = 'IMAGE';
			elem.src = `https://vidble.com/${groups[1]}_med.jpg`;

			if (RESUtils.pageType() === 'linklist') {
				$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
			}

			return elem;
		}

		const albumGroups = albumHashRe.exec(elem.href);

		if (albumGroups) {
			elem.imgHash = albumGroups[1];

			const { pics } = await RESEnvironment.ajax({
				url: RESUtils.string.encode`https://vidble.com/album/album/${albumGroups[1]}?json=1`,
				type: 'json'
			});

			elem.type = 'GALLERY';
			elem.src = pics.map(src => ({ src }));

			return elem;
		}

		throw new Error('vidble URL not an album or image');
	}
});
