addLibrary('mediaHosts', 'livememe', {
	domains: ['livememe.com'],
	detect: href => (/^https?:\/\/(?:www\.livememe\.com|lvme\.me)\/(?!edit)([\w]+)\/?/i).exec(href),
	handleLink(elem, [, id]) {
		elem.type = 'IMAGE';
		elem.src = `https://www.livememe.com/${id}.jpg`;
		if (RESUtils.pageType() === 'linklist') {
			$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
		}
		return elem;
	}
});
