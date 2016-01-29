addLibrary('mediaHosts', 'giphy', {
	domains: ['giphy.com'],
	logo: '//giphy.com/static/img/favicon.png',
	detect: function(href, elem) {
		return href.indexOf('giphy.com') !== -1;
	},
	handleLink: function(elem) {
		var def = $.Deferred();

		var hashRe = /^http:\/\/(?:www\.)?giphy\.com\/gifs\/(.*?)(\/html5)?$/i;
		var groups = hashRe.exec(elem.href);

		if (!groups) return def.reject();

		var isHtml5 = (groups[2]) ? true : false;
		var giphyUrl = location.protocol + '//giphy.com/gifs/' + groups[1];
		var mp4Url = location.protocol + '//media.giphy.com/media/' + groups[1] + '/giphy.mp4';
		var gifUrl = location.protocol + '//media.giphy.com/media/' + groups[1] + '/giphy.gif';

		def.resolve(elem, { isHtml5: isHtml5, giphyUrl: giphyUrl, mp4Url: mp4Url, gifUrl: gifUrl });

		return def.promise();
	},
	handleInfo: function(elem, info) {
		if (info.isHtml5) {

			// html5 video player
			var generate = function(options) {
				var template = RESTemplates.getSync('GiphyUI');
				var video = {
					loop: true,
					autoplay: true,
					muted: true,
					giphyUrl: info.giphyUrl,
					brand: {
						'url': info.giphyUrl,
						'name': 'Giphy',
						'img': ''
					}
				};
				video.sources = [
					{
						'source': info.mp4Url,
						'type': 'video/mp4'
					}
				];
				var element = template.html(video)[0];
				new MediaPlayer(element);
				return element;
			};

			elem.type = 'GENERIC_EXPANDO';
			elem.expandoClass = ' video-muted';
			elem.expandoOptions = {
				generate: generate,
				media: info
			};

		} else {

			// gif
			elem.type = 'IMAGE';
			elem.src = info.gifUrl;
		}

		if (RESUtils.pageType() === 'linklist') {
			$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
		}
		return $.Deferred().resolve(elem).promise();
	}
});
