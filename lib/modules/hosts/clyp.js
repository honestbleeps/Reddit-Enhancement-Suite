addLibrary('mediaHosts', 'clyp', {
	domains: ['clyp.it'],
	logo: '//d2cjvbryygm0lr.cloudfront.net/favicon.ico',
	detect: function(href, elem) {
		// reddit's expando is identical to ours, so ignore posts that have it
		return $(elem).closest('.entry').find('.expando-button.video:not(.commentImg)').length === 0;
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		var hashRe = /^https?:\/\/clyp\.it\/(playlist\/)?([A-Za-z0-9]+)/i;
		var groups = hashRe.exec(elem.href);

		if (groups) {
			var urlBase = groups[1] ? '//clyp.it/playlist/' : '//clyp.it/';
			def.resolve(elem, urlBase + groups[2] + '/widget');
		} else {
			def.reject();
		}

		return def.promise();
	},
	handleInfo: function(elem, info) {
		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', info);
		elem.setAttribute('data-height', '160px');
		elem.setAttribute('data-width', '100%');
		return $.Deferred().resolve(elem).promise();
	}
});
