modules['showImages'].siteModules['clyp'] = {
	domains: ['clyp.it'],
	detect: function(href, elem) {
		if (href.indexOf('clyp.it') !== -1) {
			if (elem.className.indexOf('title') === -1) return true;
		}
		return false;
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
};
