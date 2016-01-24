addLibrary('mediaHosts', 'vidble', {
	domains: ['vidble.com'],
	logo: '//vidble.com/assets/ico/favicon.ico',
	detect: function(href, elem) {
		return href.indexOf('vidble.com') > 0;
	},
	handleLink: function(elem) {
		var def = $.Deferred(),
			hashRe = /^https?:\/\/(?:www\.)?vidble.com\/show\/([a-z0-9]+)/i,
			albumHashRe = /^https?:\/\/(?:www\.)?vidble.com\/album\/([a-z0-9]+)/i,
			apiPrefix = location.protocol + '//vidble.com/album/',
			groups = hashRe.exec(elem.href);

		if (groups) {
			def.resolve(elem, location.protocol + '//vidble.com/' + groups[1] + '_med.jpg');
		} else {
			var albumGroups = albumHashRe.exec(elem.href);
			if (albumGroups) {
				var apiURL = apiPrefix + 'album/' + encodeURIComponent(albumGroups[1]) + '?json=1';
				elem.imgHash = albumGroups[1];

				RESEnvironment.ajax({
					method: 'GET',
					url: apiURL,
					// aggressiveCache: true,
					onload: function(response) {
						if (response.status === 404) {
							return def.reject();
						}
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
			}
		}
		return def.promise();
	},
	handleInfo: function(elem, info) {
		if (typeof info === 'string') {
			// direct image link
			elem.type = 'IMAGE';
			elem.src = info;
			if (RESUtils.pageType() === 'linklist') {
				$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
			}
		} else {
			// album link
			modules['showImages'].siteModules['vidble'].handleGallery(elem, info);
		}
		return $.Deferred().resolve(elem).promise();
	},
	handleGallery: function(elem, info) {
		elem.src = info.pics.map(function(e, i, a) {
			return {
				src: location.protocol + e,
				href: location.protocol + e
			};
		});
		elem.type = 'GALLERY';
		return $.Deferred().resolve(elem).promise();
	}
});
