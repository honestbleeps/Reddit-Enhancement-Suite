modules['showImages'].siteModules['tumblr'] = {
	domains: ['tumblr.com'],
	calls: {},
	APIKey: 'WeJQquHCAasi5EzaN9jMtIZkYzGfESUtEvcYDeSMLICveo3XDq',
	matchRE: /^https?:\/\/([a-z0-9\-]+\.tumblr\.com)\/post\/(\d+)(?:\/.*)?$/i,
	detect: function(href, elem) {
		return modules['showImages'].siteModules['tumblr'].matchRE.test(elem.href);
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		var siteMod = modules['showImages'].siteModules['tumblr'];
		var groups = siteMod.matchRE.exec(elem.href);
		if (groups) {
			var apiURL = 'http://api.tumblr.com/v2/blog/' + encodeURIComponent(groups[1]) + '/posts?api_key=' + encodeURIComponent(siteMod.APIKey) + '&id=' + encodeURIComponent(groups[2]) + '&filter=raw';
			if (apiURL in siteMod.calls) {
				if (siteMod.calls[apiURL] != null) {
					def.resolve(elem, siteMod.calls[apiURL]);
				} else {
					def.reject();
				}
			} else {
				RESUtils.runtime.ajax({
					method: 'GET',
					url: apiURL,
					// aggressiveCache: true,
					onload: function(response) {
						try {
							var json = JSON.parse(response.responseText);
							if ('meta' in json && json.meta.status === 200) {
								siteMod.calls[apiURL] = json;
								def.resolve(elem, json);
							} else {
								siteMod.calls[apiURL] = null;
								def.reject();
							}
						} catch (error) {
							siteMod.calls[apiURL] = null;
							def.reject();
						}
					},
					onerror: function(response) {
						def.reject();
					}
				});
			}
		} else {
			def.reject();
		}
		return def.promise();
	},
	handleInfo: function(elem, info) {
		var def = $.Deferred();
		var original_url = elem.href;
		var post = info.response.posts[0];
		switch (post.type) {
			case 'photo':
				if (post.photos.length > 1) {
					elem.type = 'GALLERY';
					elem.src = post.photos.map(function(e) {
						return {
							src: e.original_size.url,
							caption: e.caption
						};
					});
				} else {
					elem.type = 'IMAGE';
					elem.src = post.photos[0].original_size.url;
				}
				break;
			case 'text':
				elem.type = 'TEXT';
				elem.imageTitle = post.title;
				if (post.format === 'markdown') {
					elem.src = modules['commentPreview'].converter.render(post.body);
				} else if (post.format === 'html') {
					elem.src = post.body;
				}
				break;
			default:
				return def.reject().promise();
		}
		elem.caption = post.caption;
		if (RESUtils.pageType() === 'linklist') {
			$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
		}
		elem.credits = 'Posted by: <a href="' + info.response.blog.url + '">' + info.response.blog.name + '</a> @ Tumblr';
		def.resolve(elem);
		return def.promise();
	}
};
