
addLibrary('mediaHosts', 'miiverse', {
	domains: [ 'miiverse.nintendo.net' ],

	name: 'Miiverse',
	attribution: false,

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

				function makePost(omitScript) {
				
					if (omitScript === false) {
						//generate code needed for Miiverse's embed script.
						
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
					}
					else {
						//create the miiverse post manually. Just an iframe with the
						//original post URL plus '/embed'
						var postID = 'unknown';
						
						var matches = info.match(/\/posts\/([0-9A-Za-z\-_]+)$/);
						if (matches && matches.length == 2)
							postID = matches[1];
						
						var frame = document.createElement('iframe');
						frame.className = 'miiverse-post-frame miiverse-post-' + postID;
						frame.src = info + '/embed';
						
						//give it some basic style
						frame.style.minWidth = '220px';
						frame.style.maxWidth = '500px';
						frame.style.width = '98%';
						frame.style.border = '1px solid #dddddd';
						
						expando.appendChild(frame);
						
						window.addEventListener('message', function(event) {
							//see if we can get the proper height.
							var matches = event.data.match(/(?:^|,)height:([0-9]+)(?:,|$)/);
							
							if (matches.length == 2) {
								frame.style.height = matches[1] + 'px';
								frame.scrolling = 'no';
							}
							else {
								frame.style.height = '500px';
							}
						}, false);
					}
				}
				
				makePost(BrowserDetect.isFirefox());

				return expando;
			},
			media: info
		};
		
		return $.Deferred().resolve(elem);
	}
});
