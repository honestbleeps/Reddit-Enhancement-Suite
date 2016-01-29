addLibrary('mediaHosts', 'imgflip', {
	domains: ['imgflip.com'],
	logo: '//imgflip.com/favicon02.png',
	detect: function(href, elem) {
		return (/^https?:\/\/imgflip\.com\/(i|gif)\/[a-z0-9]+/).test(elem.href);
	},
	handleLink: function(elem) {
		var def = $.Deferred(),
			groups = (/^https?:\/\/imgflip\.com\/(i|gif)\/([a-z0-9]+)/).exec(elem.href);
		def.resolve(elem, '//i.imgflip.com/' + groups[2] + '.' + (groups[1] === 'gif' ? 'gif' : 'jpg'));
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
