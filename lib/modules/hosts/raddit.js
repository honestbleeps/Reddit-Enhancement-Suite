addLibrary('mediaHosts', 'raddit', {
	name: 'radd.it',
	attribution: false,
	domains: ['radd.it'],
	options: {
		'show playlister toggle': {
			description: 'Show a toggle for radd.it embeds in subreddits with sidebar links to a raddit.com/r/subreddit playlist',
			value: true,
			type: 'boolean'
		},
		'always show sidebar playlister': {
			description: 'Always show the radd.it embed in the sidebar when applicable',
			value: false,
			type: 'boolean'
		}
	},
	detect: function(href, elem) { return href.indexOf('radd.it/') !== -1; },
	handleLink: function(elem) {
		var def = $.Deferred(),
			hashRe = /^https?:\/\/(?:(?:www|m|embed)\.)?radd\.it(\/(?:search|r|user|comments|playlists)\/.+)/i,
			groups = hashRe.exec(elem.href);

		if (groups) {
			def.resolve(elem,  location.protocol + '//radd.it' + groups[1] + (groups[1].indexOf('?') === -1 ? '?embed' : '&embed'));
		} else {
			def.reject();
		}

		return def.promise();
	},
	handleInfo: function(elem, info) {
		var generate = function(options) {
			var element = document.createElement('iframe');
			element.src = info;
			element.height = '640px';
			element.width = '320px';

			return element;
		};

		elem.type = 'GENERIC_EXPANDO';
		elem.expandoClass = ' video';
		elem.expandoOptions = {
			generate: generate,
			media: info
		};
		return $.Deferred().resolve(elem).promise();
	},
	go: function() {
		if (modules['showImages'].options['display radd.it'].value === false) return;
		modules['showImages'].siteModules['raddit'].handleSidebarLink();
	},
	handleSidebarLink: function() {
		// check sidebar for radd.it links, add embedded player option to toolbar if found
		var radditLink = document.querySelector('.side .md a[href^="http://radd.it/r/"], .side .md a[href^="https://radd.it/r/"]');
		if (radditLink) {
			var path = radditLink.href.match(/https?:\/\/radd\.it(\/.*)/)[1];

			if (modules['showImages'].options['always show sidebar playlister'].value) {
				modules['showImages'].siteModules['raddit'].toggleSidebarPlaylist(path);
			}

			if (modules['showImages'].options['display radd.it'].value &&
					modules['showImages'].options['show playlister toggle'].value) {
				modules['showImages'].siteModules['raddit'].addPlaylisterToggle(path);
			}
		}
	},
	addPlaylisterToggle: function(path) {
		if (modules['showImages'].options['display radd.it'].value === false) return;
		if (modules['showImages'].options['show playlister toggle'].value === false) return;

		var mainMenuUL = RESUtils.getHeaderMenuList();
		if (!mainMenuUL) return;
		var li = document.createElement('li'),
			a = document.createElement('a'),
			text = document.createTextNode('playlister');
		li.className = 'RES-raddit-embed';
		li.title = 'show/hide radd.it' + path + ' playlist in the sidebar';

		a.href = '#';
		a.className = 'RES-raddit-embed';
		a.addEventListener('mousedown', function(e) {
			e.preventDefault();
			modules['showImages'].siteModules['raddit'].toggleSidebarPlaylist(path, true);
		}, true);

		a.appendChild(text);
		li.appendChild(a);

		mainMenuUL.appendChild(li);
	},
	toggleSidebarPlaylist: function(path, autoplay) {
		var sb = document.querySelector('.side');
		var listr = document.querySelector('.side iframe.RES-raddit');

		if (listr) {
			sb.removeChild(listr);		// nix it if it exists.
		} else {						// otherwise, create it.
			var width = window.getComputedStyle(sb).width;

			var src = document.location.protocol + '//radd.it/' + path + (path.indexOf('?') === -1 ? '?embed' : '&embed');

			listr = document.createElement('iframe');
			listr.className = 'RES-raddit';
			listr.src = src;
			listr.width = width;
			listr.height = '640px';
			listr.style.marginBottom = '5px';
			sb.insertBefore(listr, sb.querySelector('.spacer'));
		}
	}
});
