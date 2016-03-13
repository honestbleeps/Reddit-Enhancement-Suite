addLibrary('mediaHosts', 'youtube', {
	attribution: false,
	domains: ['youtube.com', 'youtu.be'],
	detect(href, elem) {
		return !elem.classList.contains('title') &&
			((/^https?:\/\/(?:www\.|m\.)?youtube\.com\/watch.*?[?&]v=([\w\-]+)/i).exec(href) || (/^https?:\/\/(?:www\.)?youtu\.be\/([\w\-]+)/i).exec(href));
	},
	handleLink(elem, [, hash]) {
		// Check url for timecode e.g t=1h23m15s
		const timecodeRe = /t=(.*?)(?:$|&)/i;
		const timecodeResult = timecodeRe.exec(elem.href);
		let starttime = 0;

		if (timecodeResult) {
			const timeBlocks = { h: 3600, m: 60, s: 1 };
			const timeRe = /[0-9]+[hms]/ig;
			// Get each segment e.g. 8m and calculate its value in seconds
			const timeMatch = timecodeResult[0].match(timeRe);

			if (timeMatch) {
				timeMatch.forEach(ts => {
					const unit = timeBlocks[ts.charAt(ts.length - 1)];
					const amount = parseInt(ts.slice(0, -1), 10);
					// Add each unit to starttime
					starttime += unit * amount;
				});
			} else {
				// support direct timestamp e.g. t=200
				starttime = parseInt(timecodeResult[0].replace('t=', ''), 10);
				if (isNaN(starttime)) starttime = 0;
			}
		}

		let src = `https://www.youtube.com/embed/${hash}?enablejsapi=1&enablecastapi=1&start=${starttime}`;

		if (modules['showImages'].options.autoplayVideo.value) {
			// Avoid auto playing more than 1 item
			if ($(elem).closest('.md').find('.expando-button.video').length === 0) src += '&autoplay=1';
		}

		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', src);
		elem.setAttribute('data-pause', '{"event":"command","func":"pauseVideo","args":""}');
		elem.setAttribute('data-play', '{"event":"command","func":"playVideo","args":""}');
	}
});
