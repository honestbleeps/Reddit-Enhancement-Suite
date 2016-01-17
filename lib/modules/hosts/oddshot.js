addLibrary('mediaHosts', 'oddshot', {
	domains: ['oddshot.tv'],
	logo: '//oddshot.tv/favicon.ico',
	name: 'Oddshot',
	detect: function(href, elem) {
		return href.indexOf('oddshot.tv') !== -1;
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		var hashRe = /^https?:\/\/(?:www\.)?oddshot.tv\/shot\/([a-z0-9_-]+)/i;
		var groups = hashRe.exec(elem.href);
		if (groups) {
			def.resolve(elem, '//oddshot.tv/shot/' + groups[1] + '/embed');
		} else {
			def.reject();
		}
		return def.promise();
	},

	handleInfo: function(elem, info) {
		if (modules['showImages'].options.autoplayVideo.value) {
			if ($(elem).closest('.md').find('.expando-button.video').length === 0) info += '?autoplay=true';
		}
		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', info);
		return $.Deferred().resolve(elem).promise();
	}
});
