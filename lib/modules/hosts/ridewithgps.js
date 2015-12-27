addLibrary('mediaHosts', 'ridewithgps', {
	domains: ['ridewithgps.com'],
	detect: href => (/^https?:\/\/(?:www\.)?ridewithgps\.com\/(trips|routes)\/(\d+)/i).exec(href),
	handleLink(elem, [, type, id]) {
		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', `https://ridewithgps.com/${type}/${id}/embed`);
	}
});
