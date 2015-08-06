//Borrowed heavily from gfycat.js
modules['showImages'].siteModules['pornbot'] = {
	domains: [ 'pornbot.net' ],
	detect: function(href, elem) {
		return (/^http:\/\/(?:w{3}\.)?(?:v\.)?pornbot\.net\/[a-z0-9]{8,}$/i).test(href);
	},
	handleLink: function(elem) {
		var hashRe = /^http:\/\/(?:w{3}\.)?(?:v\.)?pornbot\.net\/([a-z0-9]{8,})$/i,
			def = $.Deferred(),
			groups = hashRe.exec(elem.href);

		if (groups) {
			var apiURL = 'http://pornbot.net/ajax/info.php?v=' + encodeURIComponent(groups[1]);
			var href = 'http://v.pornbot.net/' + encodeURIComponent(groups[1]);
			RESUtils.runtime.ajax({
				method: 'GET',
				url: apiURL,
				aggressiveCache: true,
				onload: function(response) {
					try {
						var json = JSON.parse(response.responseText);
						if (json.error) throw json.error;
						json.src = href;
						def.resolve(elem, json);
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
		var generate = function(options) {
			var template = RESTemplates.getSync('PornbotUI');
			var video = {
				loop: true,
				autoplay: true, // PornBot always has muted or no auto, so autoplay is OK
				muted: true,
				directurl: elem.href
			};
			video.poster = info.poster;
			video.sources = [
				{
					'source': info.mp4Url,
					'type': 'video/mp4',
					'class': 'pbRmp4src'
				}
			];
			if (info.webmUrl) {
				video.sources.unshift({
					'source': info.webmUrl,
					'type': 'video/webm',
					'class': 'pbRwebmsrc'
				});
			}
			var element = template.html(video)[0],
				v = element.querySelector('video');

			// set the max width to the width of the entry area
			v.style.maxWidth = $(elem).closest('.entry').width() + 'px';
			new window.pornbotObject(element,elem.href,info.poster);
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

		return $.Deferred().resolve(elem).promise();
	}
};
