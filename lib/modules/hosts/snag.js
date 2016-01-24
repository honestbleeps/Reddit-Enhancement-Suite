addLibrary('mediaHosts', 'snag', {
	name: 'snag.gy',
	logo: 'http://snag.gy/assets/images/favicon.ico',
	domains: ['snag.gy'],
	detect: function(href, elem) {
		return href.indexOf('snag.gy/') !== -1;
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		var href = elem.href;
		var extensions = ['.jpg', '.png', '.gif'];
		if (href.indexOf('i.snag') === -1) href = href.replace('snag.gy', 'i.snag.gy');
		if (extensions.indexOf(href.substr(-4)) === -1) href = href + '.jpg';
		def.resolve(elem, {
			src: href
		});
		return def.promise();
	},
	handleInfo: function(elem, info) {
		elem.type = 'IMAGE';
		elem.src = info.src;
		if (RESUtils.pageType() === 'linklist') {
			$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
		}
		return $.Deferred().resolve(elem).promise();
	}
});
