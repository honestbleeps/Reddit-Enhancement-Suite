
modules['showImages'].siteModules['miiverse'] = {
	domains: [ 'miiverse.nintendo.net' ],

	name: 'Miiverse',

	detect: function(href, elem) {
		return href.indexOf('miiverse.nintendo.net/posts/') !== -1;
	},

	handleLink: function(elem) {
		var def = $.Deferred();

		def.resolve(elem, elem.href);

		return def;
	},

	handleInfo: function(elem, info) {
		
		elem.type = 'GENERIC_EXPANDO';
		elem.expandoClass = ' selftext miiverse';
		
		elem.expandoOptions = {
			generate: function () {
				var expando = RESUtils.createElement('div', '', 'expando');

				var	miiversePost = RESUtils.createElement('div');
				miiversePost.className = 'miiverse-post';
				miiversePost.setAttribute('lang', 'en');
				miiversePost.setAttribute('data-miiverse-embedded-version', '1');
				miiversePost.setAttribute('data-miiverse-cite', info);
				
				var miiverseScript = RESUtils.createElement('script');
				miiverseScript.setAttribute('async', 'async');
				miiverseScript.setAttribute('src', 'https://miiverse.nintendo.net/js/embedded.min.js');
				miiverseScript.setAttribute('charset', 'utf-8');
				
				expando.appendChild(miiversePost);
				expando.appendChild(miiverseScript);

				return expando;
			},
			media: info
		};
		
		return $.Deferred().resolve(elem);
	}
};
