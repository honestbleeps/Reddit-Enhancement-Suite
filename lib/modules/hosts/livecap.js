addLibrary('mediaHosts', 'livecap', {
	domains: ['livecap.tv'],
	logo: '//www.livecap.tv/public/images/16x16.png',
	name: 'LiveCap',
	videoDetect: document.createElement('VIDEO'),
	detect: function(href, elem) {
		return href.indexOf('livecap.tv') !== -1;
	},

	handleLink: function(elem) {
		var def = $.Deferred();

		var hashRe = /^https?:\/\/(?:www\.)?livecap.tv\/s\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9]+)/i;
		var groups = hashRe.exec(elem.href);

		if (groups) {
			def.resolve(elem, '//www.livecap.tv/s/embed/' + groups[1] + '/'+groups[2]);
		} else {
			def.reject();
		}

		return def.promise();
	},

	handleInfo: function(elem, info) {
		elem.type = 'IFRAME';

		if (modules['showImages'].options.autoplayVideo.value) {
			// Avoid auto playing more than 1 item
			if ($(elem).closest('.md').find('.expando-button.video').length === 0) info += '?autoplay=1';
		}

		elem.setAttribute('data-embed', info);
		elem.setAttribute('data-pause', '{"method":"pause"}');
		elem.setAttribute('data-play', '{"method":"play"}');

		return $.Deferred().resolve(elem).promise();
	}
});
