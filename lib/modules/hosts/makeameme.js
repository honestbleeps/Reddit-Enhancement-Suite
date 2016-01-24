addLibrary('mediaHosts', 'makeameme', {
	domains: ['makeameme.org'],
	logo: 'http://makeameme.org/images/favicons/favicon-32x32.png',
	detect: function(href, elem) {
		return href.indexOf('makeameme.org') !== -1;
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		var hashRe = /^http:\/\/makeameme\.org\/meme\/([\w\-]+)\/?/i;
		var groups = hashRe.exec(elem.href);
		if (groups) {
			def.resolve(elem, 'http://makeameme.org/media/created/' + groups[1] + '.jpg');
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
