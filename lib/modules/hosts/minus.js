modules['showImages'].siteModules['minus'] = {
	name: 'min.us',
	domains: ['min.us'],
	calls: {},
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
					var calls = modules['showImages'].siteModules['minus'].calls;
					if (apiURL in calls) {
						if (calls[apiURL] != null) {
							def.resolve(elem, calls[apiURL]);
						} else {
							def.reject();
						}
					} else {
						BrowserStrategy.ajax({
							method: 'GET',
							url: apiURL,
							onload: function(response) {
								try {
									var json = JSON.parse(response.responseText);
									modules['showImages'].siteModules['minus'].calls[apiURL] = json;
									def.resolve(elem, json);
								} catch (e) {
									modules['showImages'].siteModules['minus'].calls[apiURL] = null;
									def.reject();
								}
							},
							onerror: function(response) {
								def.reject();
							}
						});
					}
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
				elem.href = info.ITEMS_GALLERY[0];
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
};
