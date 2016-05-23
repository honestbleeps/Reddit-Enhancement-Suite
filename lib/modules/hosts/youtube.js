export default {
	moduleID: 'youtube',
	name: 'youtube',
	attribution: false,
	domains: ['youtube.com', 'youtu.be'],
	detect(href, elem) {
		return !elem.classList.contains('title') &&
			(/^https?:\/\/(?:youtu\.be|(?:www\.|m\.)?youtube\.com)\/?(?:watch|embed)?(?:.*?v=|v\/|\/)([\w-]+)/i).exec(href);
	},
	handleLink(href, [, hash]) {
		// Check url for timecode e.g t=1h23m15s
		const starttimeRe = /[&\?](?:t=|start=)([0-9hms]+)/i;
		const starttimeResult = starttimeRe.exec(href);
		// End time is always in integer format, no need to parse
		const endtimeRe = /[&\?]end=([0-9]+)/i;
		const endtimeResult = endtimeRe.exec(href);
		// Finds playlist id if included
		const playlistRe = /[&\?]list=([\w\-_]+)/i;
		const playlistResult = playlistRe.exec(href);

		let starttime = 0;
		if (starttimeResult) {
			const timeBlocks = { h: 3600, m: 60, s: 1 };
			const timeRe = /[0-9]+[hms]/ig;
			// Get each segment e.g. 8m and calculate its value in seconds
			const timeMatch = starttimeResult[1].match(timeRe);

			if (timeMatch) {
				timeMatch.forEach(ts => {
					const unit = timeBlocks[ts.charAt(ts.length - 1)];
					const amount = parseInt(ts.slice(0, -1), 10);
					// Add each unit to starttime
					starttime += unit * amount;
				});
			} else {
				// support direct timestamp e.g. t=200
				starttime = parseInt(starttimeResult[1], 10);
				if (isNaN(starttime)) starttime = 0;
			}
		}

		let src = `https://www.youtube.com/embed/${hash}?enablejsapi=1&enablecastapi=1&start=${starttime}`;

		if (endtimeResult) {
			// `&version=3` seems to be required for end time to work
			src += `&end=${endtimeResult[1]}&version=3`;
		}

		if (playlistResult) {
			// appends playlist id if found
			src += `&list=${playlistResult[1]}`;
		}

		return {
			type: 'IFRAME',
			embed: src,
			embedAutoplay: `${src}&autoplay=1`,
			pause: '{"event":"command","func":"pauseVideo","args":""}',
			play: '{"event":"command","func":"playVideo","args":""}',
		};
	},
};
