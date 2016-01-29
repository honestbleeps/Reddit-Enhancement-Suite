addLibrary('mediaHosts', 'picshd', {
	domains: ['picshd.com'],
	logo: 'http://picshd.com/assets/ico/favicon.ico',
	detect: function(href, elem) {
		return href.indexOf('picshd.com/') !== -1;
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		var hashRe = /^https?:\/\/(?:i\.|edge\.|www\.)*picshd\.com\/([\w]{5,})(\..+)?$/i;
		var groups = hashRe.exec(elem.href);
		if (groups) {
			def.resolve(elem, 'http://i.picshd.com/' + groups[1] + '.jpg');
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
