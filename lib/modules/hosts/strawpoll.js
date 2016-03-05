addLibrary('mediaHosts', 'strawpoll', {
	domains: ['strawpoll.me'],
	detect: function(href, elem) {
		return href.indexOf('strawpoll.me/') !== -1;
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		// Embed links should also work correctly
		var groups = (/^https?:\/\/(?:www\.)?strawpoll\.me\/(embed_[0-9]\/)?([0-9]*)/i).exec(elem.href);

		if (groups) {
			def.resolve(elem, '//strawpoll.me/embed_1/' + groups[2]);
		} else {
			def.reject(); 
		}
		return def.promise();
	},
	handleInfo: function(elem, info) {
		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', info);
		elem.setAttribute('data-height', '500px');
		elem.setAttribute('data-width', '95%');
		elem.setAttribute('data-maxwidth', '700px');
		return $.Deferred().resolve(elem).promise();
	}
});
