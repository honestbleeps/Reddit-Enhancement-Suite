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
		var hashRe = /^http:\/\/clyp\.it\/(playlist\/)?([A-Za-z0-9]+)\/?/i;
		var groups = hashRe.exec(elem.href);

		if (groups) {
			var urlBase = groups[1] ? 'http://clyp.it/playlist/' : 'http://clyp.it/';
			def.resolve(elem, urlBase + groups[2] + '/widget');
		} else {
			def.reject();
		}

		return def.promise();
	},
	handleInfo: function(elem, info) {
		var generate = function(options) {
			var element = document.createElement('iframe');
			element.src = info;
			element.height = '160px';
			element.width = '100%';

			return element;
		};

		elem.type = 'GENERIC_EXPANDO';
		elem.expandoClass = ' video';
		elem.expandoOptions = {
			generate: generate,
			media: info
		};

		return $.Deferred().resolve(elem).promise();
	}
};
