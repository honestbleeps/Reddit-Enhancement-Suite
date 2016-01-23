addLibrary('mediaHosts', 'vidble', {
	domains: ['vidble.com'],
	detect: href => (/^https?:\/\/(?:www\.)?vidble.com\/(show|album)\/([a-z0-9]+)/i).exec(href),
	async handleLink(elem, [, type, hash]) {
		switch (type) {
			case 'show':
				elem.type = 'IMAGE';
				elem.src = `https://vidble.com/${hash}_med.jpg`;
				return;
			case 'album':
				const urlObj = new URL(elem.href);
				const { pics } = await RESEnvironment.ajax({
					url: RESUtils.string.encode`https://vidble.com/album/album/${hash}?json=1`,
					type: 'json'
				});
				elem.type = 'GALLERY';
				elem.src = pics.map((src, i) => {
					urlObj.hash = `#pic_${i}`;
					return {
						src,
						href: urlObj.href
					};
				});
				return;
		}
	}
});
