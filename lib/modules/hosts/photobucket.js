addLibrary('mediaHosts', 'photobucket', {
	domains: ['photobucket.com'],
	logo: '//pic2.pbsrc.com/common/favicon.ico',
	go: function() {},
	detect: function(href, elem) {
		return href.indexOf('photobucket.com') !== -1;
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		var href = elem.href;
		var hashRe = /((i|s|)[0-9]{1,})|media|smg|img(?=.photobucket.com)/i;
		var apiUrl = 'http://api.photobucket.com/v2/media/fromurl?url=';
		var match = href.match(hashRe);
		if (match) {
			if (href.lastIndexOf('.html') !== -1) {
				href = href.replace('.html', '');
			}
			//user linked direct image so no need to hit API
			if (match[0].indexOf('i') !== -1) {
				def.resolve(elem, href);
			} else {
				var encodedUrl = encodeURIComponent(href);
				RESEnvironment.ajax({
					method: 'GET',
					url: apiUrl + encodedUrl,
					onload: function(response) {
						try {
							if (response.status === 200) {
								var json = JSON.parse(response.responseText);
								def.resolve(elem, json);
							} else {
								def.reject();
							}
						} catch (e) {
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
		elem.type = 'IMAGE';
		if (info instanceof Object) {
			elem.src = info.imageUrl;
		} else {
			elem.src = info;
		}

		if (RESUtils.pageType() === 'linklist') {
			$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
		}

		return $.Deferred().resolve(elem).promise();
	}
});
