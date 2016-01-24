addLibrary('mediaHosts', 'livememe', {
	domains: ['livememe.com'],
	logo: '//livememe.com/favicon.ico',
	detect: function(href, elem) {
		return href.indexOf('livememe.com') !== -1;
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		var hashRe = /^http:\/\/(?:www\.livememe\.com|lvme\.me)\/(?!edit)([\w]+)\/?/i;
		var groups = hashRe.exec(elem.href);
		if (groups) {
			def.resolve(elem, 'http://www.livememe.com/' + groups[1] + '.jpg');
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
