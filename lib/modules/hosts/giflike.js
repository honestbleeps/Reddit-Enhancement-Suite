addLibrary('mediaHosts', 'giflike', {
	domains: ['giflike.com'],
	acceptRegex: /^https?:\/\/(?:\w+\.)?giflike\.com\/(?:a\/)?(\w{7})(?:\/.*)?/i,
	detect: function (href, elem) {
		var siteMod = modules['showImages'].siteModules['giflike'];
		return siteMod.acceptRegex.test(href);
	},
	handleLink: function (elem) {
		var def = $.Deferred();
		var siteMod = modules['showImages'].siteModules['giflike'];
		var groups = siteMod.acceptRegex.exec(elem.href);
		if (groups) {
			def.resolve(elem, {
				videoId: groups[1]
			});
		} else {
			def.reject();
		}
		return def.promise();
	},
	handleInfo: function (elem, info) {
		elem.expandoOptions = {
			autoplay: true, // Giflike only supports muted videos.
			loop: true // Loops since it's gif-like, short form.
		};

		var sources = [{
			'file': 'http://i.giflike.com/' + info.videoId + '.webm',
			'type': 'video/webm'
		}, {
			'file': 'http://i.giflike.com/' + info.videoId + '.mp4',
			'type': 'video/mp4'
		}, {
			'file': 'http://i.giflike.com/' + info.videoId + '.gif',
			'type': 'image/gif'
		}];

		elem.type = 'VIDEO';
		$(elem).data('sources', sources);
		if (RESUtils.pageType() === 'linklist') {
			$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
		}
		return $.Deferred().resolve(elem).promise();
	}
});
