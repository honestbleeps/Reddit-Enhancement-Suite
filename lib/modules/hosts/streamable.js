addLibrary('mediaHosts', 'streamable', {
	domains: ['streamable.com'],
	logo: '//cdn.streamable.com/static/img/favicon.ico',
	detect: function(href, elem) {
		// Only find comments, not the titles.
		if (href.indexOf('streamable.com') !== -1) {
			if (!elem.classList.contains('title')) return true;
		}
		return false;
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		var hashRe = /^https?:\/\/(?:www\.)?streamable\.com\/([\w]+)/i;
		var groups = hashRe.exec(elem.href);
		if (groups) {
			def.resolve(elem, '//streamable.com/res/' + groups[1] );
		} else {
			def.reject();
		}
		return def.promise();
	},
	handleInfo: function(elem, info) {
		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', info);
		elem.setAttribute('data-pause', '{"method":"pause"}');
		elem.setAttribute('data-play', '{"method":"play"}');
		return $.Deferred().resolve(elem).promise();
	}
});
