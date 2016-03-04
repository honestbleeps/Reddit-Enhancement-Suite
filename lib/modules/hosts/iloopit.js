modules['showImages'].siteModules['iloopit'] = {
	domains: ['iloopit.net'],
	name: 'iLoopit - gif maker',
	acceptRegex: /^https?:\/\/(?:\w+\.)?iloopit\.net\/[\-a-z\ \/%20]+?\/\?type=looplayer&loopid=(\d+)/i,
	acceptRegexNice: /^https?:\/\/(?:\w+\.)?iloopit\.net\/(\d+)\/[a-z\-\/]+((\?type=looplayer)|(\?type=embed))?/i,
	detect: function(href, elem) {
		var siteMod = modules['showImages'].siteModules['iloopit'];
		return siteMod.acceptRegex.test(href) || siteMod.acceptRegexNice.test(href);
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		var siteMod = modules['showImages'].siteModules['iloopit'];
		var groups = siteMod.acceptRegex.exec(elem.href) || siteMod.acceptRegexNice.exec(elem.href);
		if (groups) {
			var apiURL = 'https://iloopit.net/api/video/' + groups[1];
			RESUtils.runtime.ajax({
				method: 'GET',
				url: apiURL,
				onload: function(response) {
					try {
						var json = JSON.parse(response.responseText);
						def.resolve(elem, json);
					} catch (error) {
						def.reject();
					}
				},
				onerror: function(response) {
					def.reject();
				}
			});
		} else {
			def.reject();
		}
		return def.promise();
	},
	handleInfo: function(elem, info) {
		elem.expandoOptions = {
			autoplay: true,
			loop: true
		};

		var sources = [{
			'file': 'https://iloopit.net/' + info.VideoPathWebm,
			'type': 'video/webm'
		}, {
			'file': 'https://iloopit.net/' + info.VideoPathMp4,
			'type': 'video/mp4'
		}, {
			'file': 'https://iloopit.net/' + info.VideoPathGif,
			'type': 'image/gif'
		}];

		elem.type = 'VIDEO';
		var $elem = $(elem);
		$elem.data('sources', sources);

		return $.Deferred().resolve(elem).promise();
	}
};
