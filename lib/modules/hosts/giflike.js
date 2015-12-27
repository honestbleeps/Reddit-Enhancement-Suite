addLibrary('mediaHosts', 'giflike', {
	domains: ['giflike.com'],
	detect: href => (/^https?:\/\/(?:\w+\.)?giflike\.com\/(?:a\/)?(\w{7})(?:\/.*)?/i).exec(href),
	handleLink(elem, [, videoId]) {
		elem.type = 'VIDEO';
		elem.expandoClass = 'video-muted';

		elem.expandoOptions = {
			autoplay: true, // Giflike only supports muted videos.
			loop: true // Loops since it's gif-like, short form.
		};

		$(elem).data('sources', [{
			file: `http://i.giflike.com/${videoId}.webm`,
			type: 'video/webm'
		}, {
			file: `http://i.giflike.com/${videoId}.mp4`,
			type: 'video/mp4'
		}, {
			file: `http://i.giflike.com/${videoId}.gif`,
			type: 'image/gif'
		}]);
	}
});
