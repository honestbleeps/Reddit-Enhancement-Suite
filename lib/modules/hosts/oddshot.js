addLibrary('mediaHosts', 'oddshot', {
	domains: ['oddshot.tv'],
	logo: '//oddshot.tv/favicon.ico',
	name: 'Oddshot',
	videoDetect: document.createElement('VIDEO'),
	detect: function(href, elem) {
		return href.indexOf('oddshot.tv') !== -1;
	},

	handleLink: function(elem) {
		var def = $.Deferred();
		var siteMod = modules['showImages'].siteModules['oddshot'];

		// Make sure the browser can play MP4 videos.
		if (siteMod.videoDetect.canPlayType('video/mp4') === '') {
			def.reject();
		} else {
			var hashRe = /^https?:\/\/(?:www\.)?oddshot.tv\/shot\/([a-z0-9_-]+)/i;
			var groups = hashRe.exec(elem.href);

			if (groups) {
				def.resolve(elem, groups[1]);
			} else {
				def.reject();
			}
		}

		return def.promise();
	},

	handleInfo: function (elem, info) {
		elem.type = 'VIDEO';
		elem.expandoOptions = {
			autoplay: false,
			loop: false,
			poster: 'https://d301dinc95ec5f.cloudfront.net/thumbs/' + info + '.shot.thumb.jpg'
		};

		var sources = [{
			'file': 'https://d301dinc95ec5f.cloudfront.net/capture/' + info + '.shot.mp4',
			'type': 'video/mp4'
		}];

		$(elem).data('sources', sources);
		if (RESUtils.pageType() === 'linklist') {
			$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
		}

		return $.Deferred().resolve(elem).promise();
	}
});
