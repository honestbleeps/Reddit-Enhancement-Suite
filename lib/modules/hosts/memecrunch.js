addLibrary('mediaHosts', 'memecrunch', {
	domains: ['memecrunch.com'],
	logo: '//memecrunch.com/static/favicon.ico',
	detect: function(href, elem) {
		return href.indexOf('memecrunch.com') !== -1;
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		var hashRe = /^http:\/\/memecrunch\.com\/meme\/([0-9A-Z]+)\/([\w\-]+)(\/image\.(png|jpg))?/i;
		var groups = hashRe.exec(elem.href);
		if (groups && typeof groups[1] !== 'undefined') {
			def.resolve(elem, 'http://memecrunch.com/meme/' + groups[1] + '/' + (groups[2] || 'null') + '/image.png');
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
		modules['showImages'].createImageExpando(elem);
	}
});
