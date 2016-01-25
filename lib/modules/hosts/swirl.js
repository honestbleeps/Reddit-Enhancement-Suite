addLibrary('mediaHosts', 'swirl', {
	domains: ['swirl.xyz'],
	logo: '//swirl.xyz/assets/swirl-2ab2a2c132658e010960fb80abe3ccc064fd0a0827d6f503e740bb01b46b51f6.png',
	detect: function(href, elem) {
		return (href.indexOf('swirl.xyz') !== -1);
	},
	handleLink: function(elem) {
		var def = $.Deferred();

		var hashRe = /^https:\/\/(?:s\.)?swirl\.xyz\/(?:s\/)?(.*?)(\.gif|\.mp4|\.webm)?$/i;
		var groups = hashRe.exec(elem.href);

		if (groups) {
			var isGif = (groups[2] == '.gif');
			var mp4Url = 'https://s.swirl.xyz/' + groups[1] + '.mp4';
			var webmUrl = 'https://s.swirl.xyz/' + groups[1] + '.webm';
			var gifUrl = 'https://s.swirl.xyz/' + groups[1] + '.gif';
			var swirlUrl = 'https://swirl.xyz/s/' + groups[1];

			def.resolve(elem, { isGif: isGif, swirlUrl: swirlUrl, mp4Url: mp4Url, webmUrl: webmUrl, gifUrl: gifUrl });
		}
		else {
			def.reject();
		}

		return def.promise();
	},
	handleInfo: function(elem, info) {

		if (info.isGif)
		{
			elem.type = 'IMAGE';
			elem.src = info.gifUrl;
		}
		else
		{
			var generate = function(options) {
				var template = RESTemplates.getSync('swirlUI');
				var params = {
					swirlUrl: info.swirlUrl,
					autoplay: modules['showImages'].options.autoplayVideo.value
				};
				params.sources = [
					{
						'source': info.webmUrl,
						'type': 'video/webm',
						'class': ''
					},
					{
						'source': info.mp4Url,
						'type': 'video/mp4',
						'class': ''
					}
				];
				var element = template.html(params)[0],
					v = element.querySelector('video');

				// set the max width to the width of the entry area
				v.style.maxWidth = $(elem).closest('.entry').width() + 'px';

				return element;
			};

			elem.type = 'GENERIC_EXPANDO';
			elem.subtype = 'VIDEO';
			// open via 'view all images'
			elem.expandOnViewAll = true;
			elem.expandoClass = ' video-muted';
			elem.expandoOptions = {
				generate: generate,
				media: info
			};
		}

		return $.Deferred().resolve(elem).promise();
	}
});
