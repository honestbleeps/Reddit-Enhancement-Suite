addLibrary('mediaHosts', 'ridewithgps', {
	domains: ['ridewithgps.com'],
	attribution: false,
	detect: function(href, elem) {
		return href.toLowerCase().indexOf('ridewithgps.com') !== -1;
	},
	go: function() {},
	handleLink: function(elem) {
		var def = $.Deferred();
		var hashRe = /^https?:\/\/(?:www\.)?ridewithgps\.com\/(trips|routes)\/(\d+).*/i;
		var groups = hashRe.exec(elem.href);
		if (groups) {
			def.resolve(elem, '//ridewithgps.com/' + groups[1] + '/' + groups[2] + '/embed');
		} else {
			def.reject();
		}
		return def.promise();
	},
	handleInfo: function(elem, info) {
		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', info);
		return $.Deferred().resolve(elem).promise();
	}
});
