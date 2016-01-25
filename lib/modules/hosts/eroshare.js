addLibrary('mediaHosts', 'eroshare', {
	domains: ['eroshare.com'],
	logo: '//eroshare.com/favicon.ico',
	detect: function(href, elem) {
		return href.indexOf('eroshare.com') !== -1;
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		var hashRe = /^https?:\/\/(?:www\.)?eroshare\.com\/((i\/)?[a-z0-9]{8,8})/i;
		var groups = hashRe.exec(elem.href);

		if (groups) {
			def.resolve(elem, '//eroshare.com/embed/' + groups[1] );
		} else {
			def.reject();
		}

		return def.promise();
	},
	handleInfo: function(elem, info) {
		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', info);
		elem.setAttribute('data-width','550');
		elem.setAttribute('data-height','550');
		return $.Deferred().resolve(elem).promise();
	}
});
