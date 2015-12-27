addLibrary('mediaHosts', 'memecrunch', {
	domains: ['memecrunch.com'],
	detect: href => (/^https?:\/\/memecrunch\.com\/meme\/([0-9A-Z]+)\/([\w\-]+)(\/image\.(png|jpg))?/i).exec(href),
	handleLink(elem, [, id, format]) {
		elem.type = 'IMAGE';
		elem.src = `https://memecrunch.com/meme/${id}/${format || 'null'}/image.png`;
		if (RESUtils.pageType() === 'linklist') {
			$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
		}
		return elem;
	}
});
