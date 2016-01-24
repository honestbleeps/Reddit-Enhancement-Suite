addLibrary('mediaHosts', 'redditbooru', {
	domains: ['redditbooru.com'],
	logo: 'http://redditbooru.com/favicon.ico',
	detect: function(href, elem) {
		return href.indexOf('redditbooru.com/gallery/') >= 0;
	},
	handleLink: function(elem) {
		var urlRegEx = /^http[s]?:\/\/([\w\.]+)?redditbooru\.com\/gallery\/([\w]+)(\/[\w\-]+)?/i,
			href = elem.href.split('?')[0],
			groups = urlRegEx.exec(href),
			def = $.Deferred(),
			apiUrl = 'http://redditbooru.com/images/?postId=',
			id;

		if (groups) {

			// this will only be set for base36 IDs
			if (groups[3].length > 0) {
				id = parseInt(groups[2], 36);
			} else {
				id = groups[2];
			}

			apiUrl += encodeURIComponent(id);
			RESEnvironment.ajax({
				method: 'GET',
				url: apiUrl,
				onload: function(response) {
					var json = {};
					try {
						json = JSON.parse(response.responseText);
						def.resolve(elem, json);
					} catch (error) {
						def.reject(elem);
					}
				}
			});
		}
		return def.promise();
	},
	handleInfo: function(elem, info) {
		if (typeof info === 'object' && info.length > 0) {
			elem.src = info.map(function(e, i, a) {
				return {
					title: e.caption,
					src: e.cdnUrl,
					href: e.cdnUrl,
					caption: e.sourceUrl.length ? 'Source: <a href="' + e.sourceUrl + '">' + e.sourceUrl + '</a>': ''
				};
			});
			elem.imageTitle = info[0].title;
			elem.type = 'GALLERY';
		}
		return $.Deferred().resolve(elem).promise();
	}
});
