addLibrary('mediaHosts', 'vimeo', {
	domains: ['vimeo.com'],
	attribution: false,
	detect: function(href, elem) {
		// Only find comments, not the titles.
		if (href.indexOf('vimeo.com') !== -1) {
			if (elem.className.indexOf('title') === -1) return true;
		}
		return false;
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		var hashRe = /^http:\/\/(?:www\.)?vimeo\.com\/([0-9]+)/i;
		var groups = hashRe.exec(elem.href);

		if (groups) {
			def.resolve(elem, '//player.vimeo.com/video/' + groups[1] );
		} else {
			def.reject();
		}

		return def.promise();
	},
	handleInfo: function(elem, info) {

		if (modules['showImages'].options.autoplayVideo.value) {
			// Avoid auto playing more than 1 item
			if ($(elem).closest('.md').find('.expando-button.video').length === 0) info += '?autoplay=true';
		}

		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', info);
		elem.setAttribute('data-pause', '{"method":"pause"}');
		elem.setAttribute('data-play', '{"method":"play"}');

		return $.Deferred().resolve(elem).promise();
	}
});
