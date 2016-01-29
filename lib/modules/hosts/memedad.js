addLibrary('mediaHosts', 'memedad', {
	domains: ['memedad.com'],
	logo: '//memedad.com/favicon.ico',
	detect: function(href, elem) {
		return href.indexOf('memedad.com') !== -1;
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		var hashRe = /^http:\/\/memedad.com\/meme\/([0-9]+)/i;
		var groups = hashRe.exec(elem.href);
		if (groups) {
			def.resolve(elem, 'http://memedad.com/memes/' + groups[1] + '.jpg');
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
