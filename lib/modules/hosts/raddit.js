addLibrary('mediaHosts', 'raddit', {
	name: 'radd.it',
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
	detect: href => (/^https?:\/\/(?:(?:www|m|embed)\.)?radd\.it(\/(?:search|r|user|comments|playlists)\/.+)/i).exec(href),
	handleLink(elem, [, suffix]) {
		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', RESUtils.insertParam(`https://radd.it${suffix}`, 'embed', '1'));
		elem.setAttribute('data-height', '640px');
		elem.setAttribute('data-width', '320px');
	},
	go() {
		if (modules['showImages'].options['display radd.it'].value === false) return;
		modules['showImages'].siteModules['raddit'].handleSidebarLink();
	},
	handleSidebarLink() {
		// check sidebar for radd.it links, add embedded player option to toolbar if found
		const radditLink = document.querySelector('.side .md a[href^="http://radd.it/r/"], .side .md a[href^="https://radd.it/r/"]');
		if (radditLink) {
			const path = radditLink.href.match(/https?:\/\/radd\.it(\/.*)/)[1];

			if (modules['showImages'].options['always show sidebar playlister'].value) {
				modules['showImages'].siteModules['raddit'].toggleSidebarPlaylist(path);
			}

			if (modules['showImages'].options['display radd.it'].value &&
					modules['showImages'].options['show playlister toggle'].value) {
				modules['showImages'].siteModules['raddit'].addPlaylisterToggle(path);
			}
		}
	},
	addPlaylisterToggle(path) {
		if (modules['showImages'].options['display radd.it'].value === false) return;
		if (modules['showImages'].options['show playlister toggle'].value === false) return;

		const mainMenuUL = $('#header-bottom-left ul.tabmenu')[0];
		if (!mainMenuUL) return;
		const li = document.createElement('li');
		const a = document.createElement('a');
		const text = document.createTextNode('playlister');
		li.className = 'RES-raddit-embed';
		li.title = `show/hide radd.it${path} playlist in the sidebar`;

		a.href = '#';
		a.className = 'RES-raddit-embed';
		a.addEventListener('mousedown', e => {
			e.preventDefault();
			modules['showImages'].siteModules['raddit'].toggleSidebarPlaylist(path, true);
		}, true);

		a.appendChild(text);
		li.appendChild(a);

		mainMenuUL.appendChild(li);
	},
	toggleSidebarPlaylist(path) {
		const sb = document.querySelector('.side');
		let listr = document.querySelector('.side iframe.RES-raddit');

		if (listr) {
			sb.removeChild(listr);		// nix it if it exists.
		} else {						// otherwise, create it.
			const width = window.getComputedStyle(sb).width;

			const src = `//radd.it/${path}${path.includes('?') ? '&' : '?'}embed`;

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
