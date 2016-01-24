addLibrary('mediaHosts', 'youtube', {
	attribution: false,
	domains: ['youtube.com', 'youtu.be'],
	detect: function(href, elem) {
		// Ignore links with expandos
		return $(elem).closest('.entry').find('.expando-button.video:not(.commentImg)').length === 0;
	},
	handleLink: function(elem) {
		var def = $.Deferred();

		var hashRe = /^https?:\/\/(?:www\.|m\.)?youtube\.com\/watch.*?[?&]v=([\w\-]+)/i;
		var altHashRe = /^https?:\/\/(?:www\.)?youtu\.be\/([\w\-]+)/i;

		var groups = hashRe.exec(elem.href);
		if (!groups) groups = altHashRe.exec(elem.href);

		if (groups) {

			// Check url for timecode e.g t=1h23m15s
			var timecodeRe = /t=(.*?)(?:$|&)/i;
			var starttime = 0, timecodeResult = timecodeRe.exec(elem.href);

			if (timecodeResult !== null) {
				var time_blocks = {'h':3600, 'm':60, 's':1},
					timeRE = /[0-9]+[hms]/ig;

				// Get each segment e.g. 8m and calculate its value in seconds
				var timeMatch = timecodeResult[0].match(timeRE);
				if (timeMatch) {
					timeMatch.forEach(function(ts){
						var unit = time_blocks[ts.charAt(ts.length-1)];
						var amount = parseInt(ts.slice(0, - 1), 10);
						// Add each unit to starttime
						starttime += unit * amount;
					});
				} else {
					// support direct timestamp e.g. t=200
					starttime = parseInt(timecodeResult[0].replace('t=',''), 10);
					if (isNaN(starttime)) starttime = 0;
				}
			}
			def.resolve(elem, '//www.youtube.com/embed/' + groups[1] + '?enablejsapi=1&enablecastapi=1&start=' + starttime);
		} else {
			def.reject();
		}

		return def.promise();
	},
	handleInfo: function(elem, info) {

		if (modules['showImages'].options.autoplayVideo.value) {
			// Avoid auto playing more than 1 item
			if ($(elem).closest('.md').find('.expando-button.video').length === 0) info += '&autoplay=1';
		}

		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', info);
		elem.setAttribute('data-pause', '{"event":"command","func":"pauseVideo","args":""}');
		elem.setAttribute('data-play', '{"event":"command","func":"playVideo","args":""}');

		return $.Deferred().resolve(elem).promise();
	}
});
