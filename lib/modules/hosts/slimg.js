addLibrary('mediaHosts', 'slimg', {
	domains: ['sli.mg', 'ioimg.com'],
	logo: '//sli.mg/favicon.ico',
	detect: href => (/^https?:\/\/(?:i\.|www\.)?(sli\.mg|ioimg\.com)\/([a-z0-9]+)\.?(png|jpe?g|gif|gifv)?$/i).exec(href),
	handleLink(elem, [, domain, id, extension]) {
		if (!extension) {
			extension = 'jpg';
		}

		if (extension === 'gifv') {
			elem.type = 'VIDEO';
			elem.expandoOptions = {
				autoplay: true,
				controls: false,
				fallback: `https://i.${domain}/${id}.gif`,
				loop: true,
				muted: true,
				sources: [{
					source: `https://i.${domain}/${id}.webm`,
					type: 'video/webm'
				}, {
					source: `https://i.${domain}/${id}.mp4`,
					type: 'video/mp4'
				}]
			};
		} else {
			elem.type = 'IMAGE';
			elem.src = `https://i.${domain}/${id}.${extension}`;
		}
	}
});
