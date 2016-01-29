addLibrary('mediaHosts', 'gifyoutube', {
	domains: ['gifyoutube.com', 'gifyt.com'],
	logo: '//cdn.gifs.com/resources/favicon.png',
	detect: function(href, elem) {
		return (href.indexOf('gifyoutube.com') !== -1 || href.indexOf('gifyt.com') !== -1);
	},
	handleLink: function(elem) {
		// for share.gifyoutube.com links, that's going to be a direct piece of media,
		// if it ends in GIF, just swap it to webm.
		var hashRe = /^https?:\/\/(?:beta\.|www\.)?(?:gifyoutube|gifyt)\.com\/gif\/(\w+)\.?/i,
			def = $.Deferred(),
			groups = hashRe.exec(elem.href),
			href = elem.href.toLowerCase(),
			siteMod = modules['showImages'].siteModules['gifyoutube'],
			beta = '',
			proto = location.protocol,
			apiURL;


		if (!groups) {
			hashRe = /^https?:\/\/share\.gifyoutube\.com\/(\w+)\.gif/i;
			groups = hashRe.exec(elem.href);

			if (!groups) {
				return def.reject();
			}
		}
		if (href.indexOf('beta.') !== -1) {
			beta = 'beta.';
			proto = 'http:'; // beta doesn't support https yet
		}
		apiURL = proto + beta + 'gifyoutube.com/api/' + encodeURIComponent(groups[1]);
		elem.onExpandData = {
			siteMod: siteMod,
			apiURL: apiURL
		};


		var info = {
			gifUrl: 'http://share.gifyoutube.com/' + groups[1] + '.gif',
			webmUrl: 'http://share.gifyoutube.com/' + groups[1] + '.webm',
			mp4Url: 'http://share.gifyoutube.com/' + groups[1] + '.mp4',
			original: elem.href
		};
		def.resolve(elem, info);
		return def.promise();
	},
	handleInfo: function(elem, info) {
		var generate = function(options) {
			var template = RESTemplates.getSync('gifyoutubeUI');
			var video = {
				loop: true,
				autoplay: true, // gifyoutube will always be muted, so autoplay is OK
				muted: true,
				directurl: elem.href
			};
			video.sources = [
				{
					'source': info.webmUrl,
					'type': 'video/webm',
					'class': 'gifyoutubewebmsrc'
				},
				{
					'source': info.mp4Url,
					'type': 'video/mp4',
					'class': 'gifyoutubemp4src'
				}
			];
			var element = template.html(video)[0],
				v = element.querySelector('video');

			// set the max width to the width of the entry area
			v.style.maxWidth = $(elem).closest('.entry').width() + 'px';
			new window.gifyoutubeObject(element, elem.href, info.gifUrl);
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

		if (RESUtils.pageType() === 'linklist') {
			$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
		}
		return $.Deferred().resolve(elem).promise();
	},
	onExpand: function(mediaLink) {
		var data = mediaLink.onExpandData;

		if (!data.apiURL) {
			return;
		}

		RESEnvironment.ajax({
			method: 'GET',
			url: data.apiURL,
			aggressiveCache: true,
			onload: function(response) {
				var json = safeJSON.parse(response.responseText);
				mediaLink.wrapperDiv.querySelector('.gifyoutube-source-button').href = json.sauce;
			}
		});
	}
});
