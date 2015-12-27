addLibrary('mediaHosts', 'makeameme', {
	domains: ['makeameme.org'],
	detect: href => (/^http:\/\/makeameme\.org\/meme\/([\w\-]+)\/?/i).exec(href),
	handleLink: function(elem, [, id]) {
		elem.type = 'IMAGE';
		elem.src = `http://makeameme.org/media/created/${id}.jpg`;
		if (RESUtils.pageType() === 'linklist') {
			$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
		}
		return elem;
	}
});
