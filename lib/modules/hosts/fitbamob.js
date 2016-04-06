addLibrary('mediaHosts', 'fitbamob', {
	domains: ['fitbamob.com', 'offsided.com'],
	logo: 'http://offsided.com/static/e23c43a/images/favicon.ico',
	detect: href => (/r\/[a-zA-Z0-9]+\/([a-zA-Z0-9]+[\/]*$)|b\/([a-zA-Z0-9]+[\/]*$)|v\/([a-zA-Z0-9]+[\/]*$)/i).exec(href),
	async handleLink(elem, [, id1, id2, id3]) {
		const info = await RESEnvironment.ajax({
			url: RESUtils.string.encode`https://fitbamob.com/link/${id1 || id2 || id3}/?format=json`,
			type: 'json',
			cacheFor: RESUtils.DAY
		});

		elem.type = 'VIDEO';
		elem.expandoOptions = {
			autoplay: true, // fitbamob is gfycat-based, thus also muted / no audio, so autoplay is OK
			controls: false,
			loop: true,
			muted: true,
			sources: [{
				source: info.mp4_url.replace('http:', 'https:'),
				type: 'video/mp4'
			}, {
				source: info.webm_url.replace('http:', 'https:'),
				type: 'video/webm'
			}]
		};
	}
});
