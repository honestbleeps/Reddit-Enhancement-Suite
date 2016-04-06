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

		elem.type = 'VIDEO';
		elem.expandoOptions = {
			autoplay: true, // PornBot always has muted or no auto, so autoplay is OK
			controls: false,
			loop: true,
			muted: true,
			poster: info.poster,
			sources: [{
				source: info.mp4Url,
				type: 'video/mp4'
			}]
		};
	}
});
