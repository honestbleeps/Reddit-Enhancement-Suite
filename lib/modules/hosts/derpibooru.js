addLibrary('mediaHosts', 'derpibooru', {
	name: 'Derpibooru',
	logo: 'https://derpiboo.ru/favicon.ico',
	domains: [
		'derpiboo.ru',
		'derpibooru.org',
		'trixiebooru.org'
	],

	detect: (_, elem) => (/^\/(?:images\/)?(\d+)$/i).exec(elem.pathname),

	fetchInfo: RESUtils.batch(async requests => {
		const maxDepth = 10;

		const { images } = await RESEnvironment.ajax({
			url: 'https://derpiboo.ru/api/v2/images/show.json',
			data: { id_numbers: requests.map(r => r.id).join(',') },
			type: 'json'
		});

		const responseById = images.reduce((map, img) => map.set(img.id_number, img), new Map());

		return requests.map(({ id, depth = 0 }) => {
			const result = responseById.get(Number(id));

			if (!result) {
				// API doesn't return a result for this image for some unknown reason
				// Example: https://derpiboo.ru/api/v2/images/show.json?id_numbers=17
				return new Error('No result');
			} else if (result.duplicate_of) {
				// Duplicate image.
				// Example: https://derpiboo.ru/api/v2/images/show.json?id_numbers=975313
				if (depth > maxDepth) {
					return new Error(`Exceeded max duplicate depth: ${maxDepth}`);
				}
				return modules['showImages'].siteModules['derpibooru'].fetchInfo({ id: result.duplicate_of, depth: depth + 1 });
			} else if (result.image) {
				// Normal image.
				// Example: https://derpiboo.ru/api/v2/images/show.json?id_numbers=0
				return result;
			} else {
				// Deleted image, or some other error.
				// Example: https://derpiboo.ru/api/v2/images/show.json?id_numbers=898402
				return new Error('Image deleted or other error');
			}
		});
	}, { size: 50 }),

	async handleLink(elem, [, id]) {
		const { image, description } = await this.fetchInfo({ id });

		elem.type = 'IMAGE';
		elem.src = image;
		elem.caption = description;
	}
});
