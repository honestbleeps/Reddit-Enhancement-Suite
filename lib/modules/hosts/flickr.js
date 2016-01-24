addLibrary('mediaHosts', 'flickr', {
	domains: ['flickr.com'],
	logo: '//s.yimg.com/pw/favicon.ico',
	detect: function(href, elem) {
		return (/^https?:\/\/(?:\w+\.)?flickr\.com\/(?:.+)\/(\d{10,})(?:\/|$)/i).test(elem.href);
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		// modules['showImages'].createImageExpando(elem);
		// var selector = '#allsizes-photo > IMG';
		var href = elem.href;
		if (href.indexOf('/sizes') === -1) {
			var inPosition = href.indexOf('/in/');
			var inFragment = '';
			if (inPosition !== -1) {
				inFragment = href.substring(inPosition);
				href = href.substring(0, inPosition);
			}

			href += '/sizes/c' + inFragment;
		}
		href = href.replace('/lightbox', '').replace('https://','http://');
		// href = 'http://www.flickr.com/services/oembed/?format=json&url=' + encodeURIComponent(href);
		href = 'http://noembed.com/embed?url=' + encodeURIComponent(href);
		RESEnvironment.ajax({
			method: 'GET',
			url: href,
			onload: function(response) {
				try {
					var json = JSON.parse(response.responseText);
					def.resolve(elem, json);
				} catch (e) {
					def.reject();
				}
			},
			onerror: function(response) {
				def.reject();
			}
		});
		return def.promise();
	},
	handleInfo: function(elem, info) {
		var def = $.Deferred();
		var imgRe = /\.(jpg|jpeg|gif|png)/i;
		if ('media_url' in info) {
			elem.imageTitle = info.title;
			if (imgRe.test(info.media_url)) {
				elem.src = info.media_url;
			} else {
				elem.src = info.thumbnail_url;
			}
			if (RESUtils.pageType() === 'linklist') {
				$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
			}
			elem.credits = 'Picture by: <a href="' + info.author_url + '">' + info.author_name + '</a> @ Flickr';
			elem.type = 'IMAGE';
			def.resolve(elem);
		} else {
			def.reject();
		}
		return def.promise();
	}
});
