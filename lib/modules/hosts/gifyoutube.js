addLibrary('mediaHosts', 'gifyoutube', {
	domains: ['gifyoutube.com', 'gifyt.com'],
	detect: href => {
		return (/^https?:\/\/(?:beta\.|www\.)?(?:gifyoutube|gifyt)\.com\/gif\/(\w+)\.?/i).exec(href) ||
			(/^https?:\/\/share\.gifyoutube\.com\/(\w+)\.gif/i).exec(href);
	},
	async handleLink(elem, [, id]) {
		// for share.gifyoutube.com links, that's going to be a direct piece of media,
		// if it ends in GIF, just swap it to webm.
		let beta = '';

		if (elem.href.toLowerCase().includes('beta.')) {
			beta = 'beta.';
		}

		const template = await RESTemplates.load('gifyoutubeUI');

		function generate(options) {
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
			element.querySelector('video').style.maxWidth = $(elem).closest('.entry').width() + 'px';
			new window.gifyoutubeObject(element, elem.href, `https://share.gifyoutube.com/${id}.gif`);
			return element;
		}

		elem.type = 'GENERIC_EXPANDO';
		elem.subtype = 'VIDEO';
		// open via 'view all images'
		elem.expandOnViewAll = true;
		elem.expandoClass = 'video-muted';

		elem.expandoOptions = {
			generate: generate,
			media: {}
		};

		elem.onExpand = async ({ wrapperDiv }) => {
			const { sauce } = await RESEnvironment.ajax({
				url: `https://gifs.com/api/${id}`,
				type: 'json',
				aggressiveCache: true
			});

			wrapperDiv.querySelector('.gifyoutube-source-button').href = sauce;
		};
	}
});
