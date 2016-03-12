addLibrary('mediaHosts', 'oddshot', {
	domains: ['oddshot.tv'],
	name: 'Oddshot',
	videoDetect: document.createElement('VIDEO'),
	detect: href => (/^https?:\/\/(?:www\.)?oddshot.tv\/shot\/([a-z0-9_-]+)/i).exec(href),
	handleLink(elem, [, hash]) {
		const siteMod = modules['showImages'].siteModules['oddshot'];

		// Make sure the browser can play MP4 videos.
		if (siteMod.videoDetect.canPlayType('video/mp4') === '') {
			throw new Error('video/mp4 is unsupported');
		}

		elem.type = 'VIDEO';
		elem.expandoOptions = {
			autoplay: false,
			loop: false,
			poster: `https://d301dinc95ec5f.cloudfront.net/thumbs/${hash}.shot.thumb.jpg`
		};

		$(elem).data('sources', [{
			'file': `https://d301dinc95ec5f.cloudfront.net/capture/${hash}.shot.mp4`,
			'type': 'video/mp4'
		}]);
	}
});
