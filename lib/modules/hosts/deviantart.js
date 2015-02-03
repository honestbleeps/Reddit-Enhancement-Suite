modules['showImages'].siteModules['deviantart'] = {
	name: 'deviantART',
	domains: ['deviantart.com'],
	calls: {},
	matchRe: /^http:\/\/(?:fav\.me\/.*|(?:.+\.)?deviantart\.com\/(?:art\/.*|[^#]*#\/d.*))$/i,
	detect: function(href, elem) {
		return modules['showImages'].siteModules['deviantart'].matchRe.test(elem.href);
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		var siteMod = modules['showImages'].siteModules['deviantart'];
		var apiURL = 'http://backend.deviantart.com/oembed?url=' + encodeURIComponent(elem.href);
		if (apiURL in siteMod.calls) {
			if (siteMod.calls[apiURL] != null) {
				def.resolve(elem, siteMod.calls[apiURL]);
			} else {
				def.reject();
			}
		} else {
			BrowserStrategy.ajax({
				method: 'GET',
				url: apiURL,
				// aggressiveCache: true,
				onload: function(response) {
					try {
						var json = JSON.parse(response.responseText);
						siteMod.calls[apiURL] = json;
						def.resolve(elem, json);
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
		return def.promise();
	},
	handleInfo: function(elem, info) {
		var def = $.Deferred(),
			imgRe = /\.(jpg|jpeg|gif|png)/i;
		switch(info.type) {
			case 'photo':
				elem.imageTitle = info.title;
				var original_url = elem.href;
				if (imgRe.test(info.url)) {
					elem.src = info.url;
					// elem.href = info.url;
				} else {
					elem.src = info.thumbnail_url;
					// elem.href = info.thumbnail_url;
				}
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				// elem.credits = 'Original link: <a href="'+original_url+'">'+original_url+'</a><br>Art by: <a href="'+info.author_url+'">'+info.author_name+'</a> @ deviantART';
				elem.credits = 'Art by: <a href="' + info.author_url + '">' + info.author_name + '</a> @ deviantART';
				elem.type = 'IMAGE';
				def.resolve(elem);
				break;
			case 'rich':
				elem.type = 'TEXT';
				elem.imageTitle = info.title;
				elem.src = info.html + ((/[^\s\.]\s*$/).test(info.html) ? '...' : '');
				elem.credits = '<a href="' + elem.href + '">Click here to read the full text</a> - Written By: <a href="' + info.author_url + '">' + info.author_name + '</a> @ deviantART';
				def.resolve(elem);
				break;
			default:
				def.reject();
		}
		return def.promise();
	}
};
