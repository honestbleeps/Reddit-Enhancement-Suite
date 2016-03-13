addLibrary('mediaHosts', 'swirl', {
	domains: ['swirl.xyz'],
	detect: href => (/^https:\/\/(?:s\.)?swirl\.xyz\/(?:s\/)?(.*?)(\.gif|\.mp4|\.webm)?$/i).exec(href),
	async handleLink(elem, [, hash, extension]) {
		const isGif = extension === '.gif';

		if (isGif) {
			elem.type = 'IMAGE';
			elem.src = `https://s.swirl.xyz/${hash}.gif`;
		} else {
			const template = await RESTemplates.load('swirlUI');

			function generate() {
				const params = {
					swirlUrl: `https://swirl.xyz/s/${hash}`,
					autoplay: modules['showImages'].options.autoplayVideo.value,
					sources: [{
						source: `https://s.swirl.xyz/${hash}.webm`,
						type: 'video/webm',
						class: ''
					}, {
						source: `https://s.swirl.xyz/${hash}.mp4`,
						type: 'video/mp4',
						class: ''
					}]
				};
				const element = template.html(params)[0];

				// set the max width to the width of the entry area
				element.querySelector('video').style.maxWidth = `${$(elem).closest('.entry').width()}px`;

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
		}
	}
});
