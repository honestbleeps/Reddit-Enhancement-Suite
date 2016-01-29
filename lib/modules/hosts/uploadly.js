
addLibrary('mediaHosts', 'uploadly', {
	domains: ['uploadly.com'],
	attribution: false,
	detect: function(href, elem) {
		return href.indexOf('uploadly.com') !== -1;
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		var hashRe = /^https?:\/\/(?:www\.)?uploadly\.com\/([a-z0-9]{8,8}(#[a-z0-9]{8,8})?)/i;
		var groups = hashRe.exec(elem.href);

		if (groups) {
			def.resolve(elem, '//uploadly.com/embed/' + groups[1] );
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
