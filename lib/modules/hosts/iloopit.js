addLibrary('mediaHosts', 'iloopit', {
	name: 'iLoopit - gif maker',
	domains: ['iloopit.net'],
	logo: '//iloopit.net/favicon.ico',
	detect: href => (
		(/^https?:\/\/(?:\w+\.)?iloopit\.net\/tube\/(\d+)/i).exec(href) ||
		(/^https?:\/\/(?:\w+\.)?iloopit\.net\/[\-a-z\ \/%20]+?\/\?type=looplayer&loopid=(\d+)/i).exec(href) ||
		(/^https?:\/\/(?:\w+\.)?iloopit\.net\/(\d+)\/[a-z\-\/]+((\?type=looplayer)|(\?type=embed))?/i).exec(href)
	),
	async handleLink(elem, [, hash]) {
		const info = await RESEnvironment.ajax({
			url: `https://iloopit.net/api/video/${hash}`,
			type: 'json'
		});

		elem.type = 'VIDEO';

		elem.expandoOptions = {
			autoplay: true,
			loop: true
		};

		$(elem).data('sources', [{
			file: `https://iloopit.net/${info.VideoPathWebm}`,
			type: 'video/webm'
		}, {
			file: `https://iloopit.net/${info.VideoPathMp4}`,
			type: 'video/mp4'
		}, {
			file: `https://iloopit.net/${info.VideoPathGif}`,
			type: 'image/gif'
		}]);
	}
});
