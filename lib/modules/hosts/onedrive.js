addLibrary('mediaHosts', 'onedrive', {
	domains: ['onedrive.live.com', '1drv.ms'],
	name: 'Microsoft OneDrive',
	videoDetect: document.createElement('VIDEO'),
	audioDetect: document.createElement('AUDIO'),
	detect: () => true,
	async handleLink(elem) {
		const siteMod = modules['showImages'].siteModules['onedrive'];
		let href = elem.href;

		await RESEnvironment.requestPermissions('http://1drv.ms/*', 'https://onedrive.live.com/*');

		if (href.includes('1drv.ms/')) {
			const response = await RESEnvironment.ajax({
				url: elem.href,
				type: 'raw',
				aggressiveCache: true
			});

			href = response.responseURL;
		}

		const hashRe = /(?:resid=|&id=)([a-z0-9!%]+)(?:.*&authkey=([a-z0-9%!_-]+)|)/i;
		const groups = hashRe.exec(href);

		if (!groups) throw new Error('No URL match found');

		const resId = decodeURIComponent(groups[1]);
		const authKey = decodeURIComponent(groups[2]);

		const json = await RESEnvironment.ajax({
			url: `https://api.onedrive.com/v1.0/drive/items/${resId}${authKey ? '?authKey=' + authKey : ''}`,
			type: 'json',
			aggressiveCache: true
		});

		if (json.error) throw new Error(`Onedrive request error: ${json.error}`);

		// The link is a folder, get its content instead.
		if (json.folder) {
			const { value: files, error } = await RESEnvironment.ajax({
				url: `https://api.onedrive.com/v1.0/drive/items/${resId}/children${authKey ? '?authKey=' + authKey : ''}`,
				type: 'json',
				aggressiveCache: true
			});

			if (error) throw new Error(`Onedrive request error: ${error}`);

			// Gallery

			const gallery = files.filter(({ file }) => file && file.mimeType.includes('image'));

			if (!gallery.length) throw new Error('No images in gallery.');

			if (gallery.length > 1) {
				elem.type = 'GALLERY';
				elem.src = gallery.map(img => ({
					title: img.name,
					caption: img.description,
					src: img['@content.downloadUrl'],
					href: img.webUrl
				}));
			} else {
				elem.type = 'IMAGE';
				elem.imageTitle = gallery[0].name;
				elem.caption = gallery[0].description;
				elem.src = gallery[0]['@content.downloadUrl'];
			}
		} else {
			const type = json.file.mimeType.substring(0, json.file.mimeType.indexOf('/'));

			switch (type) {
				case 'image':
					elem.type = 'IMAGE';
					elem.src = json['@content.downloadUrl'];
					break;
				case 'video':
					if (siteMod.videoDetect.canPlayType(json.file.mimeType) === '') {
						throw new Error(`Unsupported video type: ${json.file.mimeType}`);
					}
					elem.type = 'VIDEO';
					elem.expandoOptions = {
						autoplay: false,
						loop: false
					};
					$(elem).data('sources', [{
						file: json['@content.downloadUrl'],
						type: json.file.mimeType
					}]);
					break;
				case 'audio':
					if (siteMod.audioDetect.canPlayType(json.file.mimeType) === '') {
						throw new Error(`Unsupported audio type: ${json.file.mimeType}`);
					}
					elem.type = 'AUDIO';
					elem.expandoOptions = {
						autoplay: true,
						loop: false
					};
					$(elem).data('sources', [{
						file: json['@content.downloadUrl'],
						type: json.file.mimeType
					}]);
					break;
				default:
					throw new Error(`Invalid type: ${type}`);
			}
		}

		return elem;
	}
});
