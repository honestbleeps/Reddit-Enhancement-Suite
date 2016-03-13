addLibrary('mediaHosts', 'gifyoutube', {
	domains: ['gifyoutube.com', 'gifyt.com'],
	logo: '//cdn.gifs.com/resources/favicon.png',
	detect: href => (
		(/^https?:\/\/(?:beta\.|www\.)?(?:gifyoutube|gifyt)\.com\/gif\/(\w+)\.?/i).exec(href) ||
		(/^https?:\/\/share\.gifyoutube\.com\/(\w+)\.gif/i).exec(href)
	),
	async handleLink(elem, [, id]) {
		const template = await RESTemplates.load('gifyoutubeUI');

		function generate() {
			const video = {
				loop: true,
				autoplay: true, // gifyoutube will always be muted, so autoplay is OK
				muted: true,
				directurl: elem.href,
				sources: [{
					source: `https://share.gifyoutube.com/${id}.webm`,
					type: 'video/webm',
					class: 'gifyoutubewebmsrc'
				}, {
					source: `https://share.gifyoutube.com/${id}.mp4`,
					type: 'video/mp4',
					class: 'gifyoutubemp4src'
				}]
			};

			const element = template.html(video)[0];

			// set the max width to the width of the entry area
			element.querySelector('video').style.maxWidth = `${$(elem).closest('.entry').width()}px`;
			window.gifyoutubeObject(element, elem.href, `https://share.gifyoutube.com/${id}.gif`);
			return element;
		}

		elem.type = 'GENERIC_EXPANDO';
		elem.subtype = 'VIDEO';
		// open via 'view all images'
		elem.expandOnViewAll = true;
		elem.expandoClass = 'video-muted';

		elem.expandoOptions = {
			generate,
			media: {}
		};

		elem.onExpand = async ({ wrapperDiv }) => {
			const { sauce } = await RESEnvironment.ajax({
				url: `https://gifs.com/api/${id}`,
				type: 'json',
				cacheFor: RESUtils.DAY
			});

			wrapperDiv.querySelector('.gifyoutube-source-button').href = sauce;
		};
	}
});
