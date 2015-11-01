addLibrary('mediaHosts', 'soundcloud', {
	domains: ['soundcloud.com'],
	detect: function(href, elem) {
		if (href.indexOf('soundcloud.com') !== -1) {
			if (elem.className.indexOf('title') === -1) return true;
		}
		return false;
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		var apiURL = 'http://soundcloud.com/oembed?url=' + encodeURIComponent(elem.href) + '&format=json&iframe=true';
		RESUtils.runtime.ajax({
			method: 'GET',
			url: apiURL,
			// aggressiveCache: true,
			onload: function(response) {
				try {
					def.resolve(elem, JSON.parse(response.responseText) );
				} catch (error) {
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
		// Get src from iframe html returned
		var src = $(info.html).attr('src');
		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', src);
		elem.setAttribute('data-pause', '{"method":"pause"}');
		elem.setAttribute('data-play', '{"method":"play"}');
		return $.Deferred().resolve(elem).promise();
	}
});
