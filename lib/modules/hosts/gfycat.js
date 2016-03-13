addLibrary('mediaHosts', 'gfycat', {
	domains: ['gfycat.com'],
	logo: '//gfycat.com/favicon2.ico',
	detect: href => href.substring(-1) !== '+' && (/^https?:\/\/(?:[\w]+.)?gfycat\.com\/(\w+)(?:\.gif)?/i).exec(href),
	async handleLink(elem, [, id]) {
		const { gfyItem: info } = await RESEnvironment.ajax({
			url: RESUtils.string.encode`https://gfycat.com/cajax/get/${id}`,
			type: 'json',
			cacheFor: RESUtils.DAY
		});

		const template = await RESTemplates.load('GfycatUI');

		function generate() {
			const video = {
				loop: true,
				autoplay: true, // gfycat always has muted or no auto, so autoplay is OK
				muted: true,
				directurl: elem.href,
				poster: `https://thumbs.gfycat.com/${info.gfyName}-poster.jpg`,
				sources: [{
					source: info.webmUrl,
					type: 'video/webm',
					class: 'gfyRwebmsrc'
				}, {
					source: info.mp4Url,
					type: 'video/mp4',
					class: 'gfyRmp4src'
				}]
			};

			const element = template.html(video)[0];

			// set the max width to the width of the entry area
			element.querySelector('video').style.maxWidth = `${$(elem).closest('.entry').width()}px`;
			window.gfyObject(element, elem.href, info.frameRate);
			return element;
		}

		elem.type = 'GENERIC_EXPANDO';
		elem.subtype = 'VIDEO';
		// open via 'view all images'
		elem.expandOnViewAll = true;
		elem.expandoClass = 'video-muted';

		elem.expandoOptions = {
			generate,
			media: info
		};
	}
});
