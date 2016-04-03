addLibrary('mediaHosts', 'strawpoll', {
	domains: ['strawpoll.me'],
	attribution: false,
	detect: href => (/^https?:\/\/(?:www\.)?strawpoll\.me\/(?:embed_[0-9]\/)?([0-9]*)/i).exec(href),
	handleLink(elem, [, uid]) {
		elem.type = 'IFRAME';
		elem.expandoClass = 'selftext';
		elem.setAttribute('data-embed', `//strawpoll.me/embed_1/${uid}`);
		elem.setAttribute('data-height', '500px');
		elem.setAttribute('data-width', '95%');
		elem.setAttribute('data-maxwidth', '700px');
	}
});
