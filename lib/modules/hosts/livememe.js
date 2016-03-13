addLibrary('mediaHosts', 'livememe', {
	domains: ['livememe.com'],
	logo: '//livememe.com/favicon.ico',
	detect: href => (/^https?:\/\/(?:www\.livememe\.com|lvme\.me)\/(?!edit)([\w]+)\/?/i).exec(href),
	handleLink(elem, [, id]) {
		elem.type = 'IMAGE';
		elem.src = `https://www.livememe.com/${id}.jpg`;
	}
});
