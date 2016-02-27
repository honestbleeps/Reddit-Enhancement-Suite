addLibrary('mediaHosts', 'pornbot', {
	domains: ['pornbot.net'],
	logo: '//pornbot.net/favicon.ico',
	detect: href => (/^https?:\/\/(?:w{3}\.)?(?:v\.)?pornbot\.net\/([a-z0-9]{8,})/i).exec(href),
	async handleLink(elem, [, hash]) {
		const info = await RESEnvironment.ajax({
			url: RESUtils.string.encode`https://pornbot.net/ajax/info.php?v=${hash}`,
			type: 'json',
			cacheFor: RESUtils.DAY
		});

		const template = await RESTemplates.load('PornbotUI');

		function generate() {
			const video = {
				loop: true,
				autoplay: true, // PornBot always has muted or no auto, so autoplay is OK
				muted: true,
				directurl: elem.href,
				poster: info.poster,
				sources: [{
					source: info.mp4Url,
					type: 'video/mp4',
					class: 'pbRmp4src'
				}]
			};
			if (info.webmUrl) {
				video.sources.unshift({
					source: info.webmUrl,
					type: 'video/webm',
					class: 'pbRwebmsrc'
				});
			}
			const element = template.html(video)[0];
			const v = element.querySelector('video');

			// set the max width to the width of the entry area
			v.style.maxWidth = `${$(elem).closest('.entry').width()}px`;
			window.pornbotObject(element, elem.href, info.poster);
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
