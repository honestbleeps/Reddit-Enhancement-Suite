addLibrary('mediaHosts', 'iloopit', {
	domains: ['iloopit.net'],
	logo: '//iloopit.net/favicon.ico',
	name: 'iLoopit - gif maker',
	detect: function (href, elem) {
		return  ((/^https?:\/\/(?:\w+\.)?iloopit\.net\/.+?\/\?type=looplayer&loopid=(\d+)/i).exec(href) ||
 	 		(/^https?:\/\/(?:\w+\.)?iloopit\.net(?:\/tube\/)?\/(\d+)\/.+?\/(?:(?:\?type=looplayer)|(?:\?type=embed))?/i).exec(href));
	},
	handleLink: function(elem) {
		var def = $.Deferred();

		var link = '';
		var testWithTitle = /iloopit\.net(?:\/tube\/)?\/(\d+)\/(.+)?\//;
		var titleResult = testWithTitle.exec(elem.href);

		if (titleResult) {
			link = 'https://iloopit.net/' + titleResult[1] + '/' + titleResult[2] + '/?type=embed';
		} else {
			link = elem.href.replace('type=looplayer', 'type=embed');
		}

		def.resolve(elem, link);

		return def.promise();
	},
	handleInfo: function(elem, link) {
		elem.expandoOptions = {
			autoplay: true,
			loop: true
		};

		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', link);

		return $.Deferred().resolve(elem).promise();
	}
});
