addLibrary('mediaHosts', 'minus', {
	name: 'min.us',
	logo: 'http://dgbc7tshfzi70.cloudfront.net/smedia/root/favicon11.png',
	domains: ['min.us'],
	detect: function(href, elem) {
		return href.indexOf('min.us') !== -1 && href.indexOf('blog.') === -1;
	},
	handleLink: function(elem) {
		var def = $.Deferred(),
			imgRe = /\.(jpg|jpeg|gif|png)/i,
			hashRe = /^http:\/\/min\.us\/([\w]+)(?:#[\d+])?$/i,
			href = elem.href.split('?')[0],
			//TODO: just make default run first and remove this
			getExt = href.split('.'),
			ext = (getExt.length > 1 ? getExt[getExt.length - 1].toLowerCase() : '');
		if (imgRe.test(ext)) {
			var groups = hashRe.exec(href);
			if (groups && !groups[2]) {
				var hash = groups[1];
				if (hash.substr(0, 1) === 'm') {
					var apiURL = 'http://min.us/api/GetItems/' + encodeURIComponent(hash);
					RESEnvironment.ajax({
						method: 'GET',
						url: apiURL,
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
				} else { // if not 'm', not a gallery, we can't do anything with the API.
					def.reject();
				}
			} else {
				def.reject();
			}
		} else {
			def.reject();
		}
		return def.promise();
	},
	handleInfo: function(elem, info) {
		var def = $.Deferred();
		//TODO: Handle titles
		//TODO: Handle possibility of flash items
		if ('ITEMS_GALLERY' in info) {
			if (info.ITEMS_GALLERY.length > 1) {
				elem.type = 'GALLERY';
				elem.src = {
					src: info.ITEMS_GALLERY
				};
			} else {
				elem.type = 'IMAGE';
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				elem.src = info.ITEMS_GALLERY[0];
			}
			def.resolve(elem);
		} else {
			def.reject();
		}
		return def.promise();
	}
});
