addLibrary('mediaHosts', 'snag', {
	name: 'snag.gy',
	domains: ['snag.gy'],
	detect: href => (/https?:\/\/snag\.gy\/(\w{5})(?:\.(\w+))?/i).exec(href),
	handleLink(elem, [, id, extension]) {
		elem.type = 'IMAGE';
		elem.src = `http://i.snag.gy/${id}.${extension || 'jpg'}`;
		if (RESUtils.pageType() === 'linklist') {
			$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
		}
		return elem;
	}
});
