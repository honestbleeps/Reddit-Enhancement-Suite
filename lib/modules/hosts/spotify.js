addLibrary('mediaHosts', 'spotify', {
	domains: [ 'open.spotify.com', 'play.spotify.com' ],

	name: 'spotify',

	detect: function(href, elem) {
		/**
		* Match the following:
		* https://open.spotify.com/track/id
		* https://play.spotify.com/artist/id
		* https://play.spotify.com/album/id
		* https://open.spotify.com/user/someUser/playlist/id
		* TODO: Check username restrictions, match with something better than \w+
		*/
		var re = /^https:\/\/(?:open|play)\.spotify\.com\/(?:track|artist|album|user\/\w+\/playlist)\/[a-zA-z0-9]+$/;
		return href.match(re) !== null;
	},

	handleLink: function(elem) {
		var def = $.Deferred();
		//Get the "track/trackId" | "user/username/playlist/playlistId" etc.
		var re = /^https:\/\/(?:open|play)\.spotify\.com\/(.*)$/;
		var match = elem.href.match(re);
		if (match && match[1]) {
			//Transform path to valid URI
			//e.g spotify:track:id || spotify:user:username:playlist:id
			var uri = 'spotify:' + match[1].split('/').join(':');
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
