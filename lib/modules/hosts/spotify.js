addLibrary('mediaHosts', 'spotify', {
	domains: [ 'open.spotify.com', 'play.spotify.com' ],

	name: 'spotify',

	detect: function(href, elem) {
		var isOpenUrl = href.indexOf('open.spotify.com/track/') !== -1;
		var isPlayUrl = href.indexOf('play.spotify.com/track/') !== -1;
		return isOpenUrl || isPlayUrl;
	},

	handleLink: function(elem) {
		var def = $.Deferred();
		var re = /^https?:\/\/(?:open|play).spotify.com\/track\/(.*)$/;
		var match = elem.href.match(re);
		if (match && match[1]) {
			var uri = 'spotify:track:' + match[1];
			def.resolve(elem, '//embed.spotify.com/?uri=' + uri);
		} else {
			def.reject();
		}

		return def;
	},

	handleInfo: function(elem, info) {
		var def = $.Deferred();
		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', info);
		elem.setAttribute('frameborder', 0);
		elem.setAttribute('allowtransparency', true);
		return $.Deferred().resolve(elem).promise();
	}
});
