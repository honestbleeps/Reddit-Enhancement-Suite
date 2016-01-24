addLibrary('mediaHosts', 'tumblr', {
	domains: ['tumblr.com'],
	logo: '//secure.assets.tumblr.com/images/favicons/favicon.ico',
	APIKey: 'WeJQquHCAasi5EzaN9jMtIZkYzGfESUtEvcYDeSMLICveo3XDq',
	matchRE: /^https?:\/\/([a-z0-9\-]+\.tumblr\.com)\/(?:post|image)\/(\d+)(?:\/|$)/i,
	detect: function(href, elem) {
		return modules['showImages'].siteModules['tumblr'].matchRE.test(elem.href);
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		var siteMod = modules['showImages'].siteModules['tumblr'];
		var groups = siteMod.matchRE.exec(elem.href);
		if (groups) {
			var apiURL = 'http://api.tumblr.com/v2/blog/' + encodeURIComponent(groups[1]) + '/posts?api_key=' + encodeURIComponent(siteMod.APIKey) + '&id=' + encodeURIComponent(groups[2]) + '&filter=raw';
			RESEnvironment.ajax({
				method: 'GET',
				url: apiURL,
				// aggressiveCache: true,
				onload: function(response) {
					try {
						var json = JSON.parse(response.responseText);
						if ('meta' in json && json.meta.status === 200) {
							def.resolve(elem, json);
						} else {
							def.reject();
						}
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
		var def = $.Deferred();
		var post = info.response.posts[0];

		function render(string) {
			return post.format === 'markdown' ?
				modules['commentPreview'].converter.render(string) :
				string;
		}

		// Overwritten in quote posts
		elem.credits = 'Posted by: <a href="' + info.response.blog.url + '">' + info.response.blog.name + '</a> @ Tumblr';

		switch (post.type) {
			case 'photo':
				elem.type = post.photos.length > 1 ? 'GALLERY' : 'IMAGE';
				elem.src = post.photos.map(function(photo) {
					return {
						src: photo.original_size.url,
						caption: photo.caption || post.caption
					};
				});
				break;
			case 'text':
				elem.type = 'TEXT';
				elem.imageTitle = post.title;
				elem.src = render(post.body);
				break;
			case 'quote':
				elem.type = 'TEXT';
				elem.credits = post.source;
				elem.src = '<blockquote><p>' + render(post.text) + '</p></blockquote>';
				break;
			case 'link':
				elem.type = 'TEXT';
				elem.imageTitle = '<a href="' + post.url + '">' + post.title + '</a>';
				elem.src = render(post.description);
				break;
			case 'chat':
				elem.type = 'TEXT';
				elem.imageTitle = post.title;
				elem.src = post.dialogue.reduce(function(pre, cur) {
					return pre + '<blockquote><p><b>' + cur.label + '</b> ' + cur.phrase + '</p></blockquote>';
				}, '');
				break;
			case 'answer':
				elem.type = 'TEXT';
				var asking;
				if (post.asking_url) {
					asking = '<a href="' + post.asking_url + '">' + post.asking_name + '</a>';
				} else {
					asking = post.asking_name;
				}
				elem.src = '<blockquote><p>' + asking + ' sent: ' + post.question + '</p></blockquote>' + render(post.answer);
				break;
			default:
				return def.reject().promise();
		}

		return def.resolve(elem).promise();
	}
});
