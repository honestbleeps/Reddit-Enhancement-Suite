addLibrary('mediaHosts', 'fitbamob', {
	domains: ['fitbamob.com', 'offsided.com'],
	detect: href => (/r\/[a-zA-Z0-9]+\/([a-zA-Z0-9]+[\/]*$)|b\/([a-zA-Z0-9]+[\/]*$)|v\/([a-zA-Z0-9]+[\/]*$)/i).exec(href),
	async handleLink(elem, [, id1, id2, id3]) {
		const info = await RESEnvironment.ajax({
			url: RESUtils.string.encode`https://fitbamob.com/link/${id1 || id2 || id3}/?format=json`,
			type: 'json',
			aggressiveCache: true
		});

		elem.type = 'VIDEO';
		elem.expandoOptions = {
			loop: true,
			autoplay: true // fitbamob is gfycat-based, thus also muted / no audio, so autoplay is OK
		};

		$(elem).data('sources', [{
			file: info.mp4_url.replace('http:', 'https:'),
			type: 'video/mp4'
		}, {
			file: info.webm_url.replace('http:', 'https:'),
			type: 'video/webm'
		}]);
	}
});
