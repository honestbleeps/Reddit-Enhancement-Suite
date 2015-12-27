addLibrary('mediaHosts', 'giphy', {
	domains: ['giphy.com'],
	detect: href => (/^https?:\/\/(?:www\.)?giphy\.com\/gifs\/(.*?)(\/html5)?$/i).exec(href),
	handleLink(elem, [, id, isHtml5]) {
		if (isHtml5) {
			// html5 video player
			elem.type = 'VIDEO';
			elem.expandoClass = 'video-muted';

			elem.expandoOptions = {
				loop: true,
				autoplay: true
			};

			$(elem).data('sources', [{
				file: `https://media.giphy.com/media/${id}/giphy.mp4`,
				type: 'video/mp4'
			}]);
		} else {
			// gif
			elem.type = 'IMAGE';
			elem.src = `https://media.giphy.com/media/${id}/giphy.gif`;
		}
	}
});
