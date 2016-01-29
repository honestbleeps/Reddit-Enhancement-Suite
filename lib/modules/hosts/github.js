addLibrary('mediaHosts', 'github', {
	domains: ['gist.github.com'],
	logo: '//assets-cdn.github.com/favicon.ico',
	name: 'github gists',
	detect: function(href, elem) {
		return href.indexOf('gist.github.com/') !== -1;
	},
	handleLink: function(elem) {
		var def = $.Deferred(),
			groups = (/^https?:\/\/gist\.github\.com\/(?:[\w-]+\/)?([a-z0-9]{20,}|\d+)/i).exec(elem.href);
		if (groups) {
			RESEnvironment.ajax({
				method: 'GET',
				url: 'https://api.github.com/gists/' + groups[1],
				aggressiveCache: true,
				onload: function(response) {
					if (response.status === 200) {
						try {
							var json = JSON.parse(response.responseText);
							def.resolve(elem, json);
						} catch (error) {
							def.reject();
						}
					} else {
						if (response.status === 403 && response.responseText.indexOf('rate limit') !== -1) {
							console.error('GitHub API limit reached');
						}
						def.reject();
					}
				},
				onerror: function(error) {
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
		elem.type = 'TEXT';
		elem.imageTitle = info.description;
		elem.src = '';
		for (var filename in info.files) {
			var file = info.files[filename];
			elem.src += '<h5>' + filename + ':</h5>';
			if (file.language === 'Markdown') {
				elem.src += window.SnuOwnd.getParser().render(file.content);
			} else {
				elem.src += '<pre><code>' + escapeHTML(file.content) + '</code></pre>';
			}
			if (file.truncated) {
				elem.src += '<p>&lt;file truncated&gt;</p>';
			}
		}
		def.resolve(elem);
		return def.promise();
	}
});
