modules['showImages'].siteModules['gfycat'] = {
	domains: ['gfycat.com'],
	options: {
		'prefer RES support': {
			description: 'Prefer RES support for gfycat rather than reddit\'s built in support',
			value: true,
			type: 'boolean'
		}
	},
	calls: {},
	detect: function(href, elem) {
		return href.indexOf('gfycat.com') !== -1 && href.substring(-1) !== '+';
	},
	handleLink: function(elem) {
		var hashRe = /^https?:\/\/(?:[\w]+.)?gfycat\.com\/(\w+)(?:\.gif)?/i,
			def = $.Deferred(),
			siteMod = modules['showImages'].siteModules['gfycat'],
			groups = hashRe.exec(elem.href),
			existingExpando = $(elem).closest('.entry').find('.expando-button.video:not(.commentImg)');

		if (groups && (siteMod.options['prefer RES support'].value || existingExpando.length === 0)) {
			existingExpando.remove();
			var apiURL = location.protocol + '//gfycat.com/cajax/get/' + encodeURIComponent(groups[1]);
			if (apiURL in siteMod.calls) {
				if (siteMod.calls[apiURL] != null) {
					def.resolve(elem, siteMod.calls[apiURL]);
				} else {
					siteMod.calls[apiURL] = null;
					def.reject();
				}
			} else {
				RESUtils.runtime.ajax({
					method: 'GET',
					url: apiURL,
					aggressiveCache: true,
					onload: function(response) {
						try {
							var json = JSON.parse(response.responseText);
							json.gfyItem.src = elem.href;
							siteMod.calls[apiURL] = json;
							def.resolve(elem, json.gfyItem);
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
		var generate = function(options) {
			var template = RESTemplates.getSync('GfycatUI');
			var video = {
				loop: true,
				autoplay: true, // gfycat always has muted or no auto, so autoplay is OK
				muted: true,
				directurl: elem.href
			};
			video.poster = location.protocol + '//thumbs.gfycat.com/'+info.gfyName+'-poster.jpg';
			// gfycat returns http:// even if the request came over https://, so let's swap it out
			if (location.protocol === 'https:') {
				info.webmUrl = info.webmUrl.replace('http:','https:');
				info.mp4Url = info.mp4Url.replace('http:','https:');
			}
			video.sources = [
				{
					'source': info.webmUrl,
					'type': 'video/webm',
					'class': 'gfyRwebmsrc'
				},
				{
					'source': info.mp4Url,
					'type': 'video/mp4',
					'class': 'gfyRmp4src'
				}
			];
			var element = template.html(video)[0],
				v = element.querySelector('video');

			// set the max width to the width of the entry area
			v.style.maxWidth = $(elem).closest('.entry').width() + 'px';
			new window.gfyObject(element,elem.href,info.frameRate);
			return element;
		};
		elem.type = 'GENERIC_EXPANDO';
		elem.subtype = 'VIDEO';
		// open via 'view all images'
		elem.expandOnViewAll = true;
		elem.expandoClass = ' video-muted';

		elem.expandoOptions = {
			generate: generate,
			media: info
		};

		if (RESUtils.pageType() === 'linklist') {
			$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
		}

		return $.Deferred().resolve(elem).promise();
	}
};
