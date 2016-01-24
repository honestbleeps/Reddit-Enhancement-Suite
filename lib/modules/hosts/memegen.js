addLibrary('mediaHosts', 'memegen', {
	domains: [
		'memegen.com',
		'memegen.de',
		'memegen.nl',
		'memegen.fr',
		'memegen.it',
		'memegen.es',
		'memegen.se',
		'memegen.pl'
	],
	logo: 'http://www.memegen.com/favicon.ico',
	detect: function(href, elem) {
		return href.indexOf('.memegen.') !== -1;
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		var hashRe = /^http:\/\/((?:www|ar|ru|id|el|pt|tr)\.memegen\.(?:com|de|nl|fr|it|es|se|pl))(\/a)?\/(?:meme|mem|mim)\/([A-Za-z0-9]+)\/?/i;
		var groups = hashRe.exec(elem.href);
		if (groups) {
			// Animated vs static meme images.
			if (groups[2]) {
				def.resolve(elem, 'http://a.memegen.com/' + groups[3] + '.gif');
			} else {
				def.resolve(elem, 'http://m.memegen.com/' + groups[3] + '.jpg');
			}
		} else {
			def.reject();
		}
		return def.promise();
	},
	handleInfo: function(elem, info) {
		elem.type = 'IMAGE';
		elem.src = info;
		if (RESUtils.pageType() === 'linklist') {
			$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
		}
		return $.Deferred().resolve(elem).promise();
	}
});
