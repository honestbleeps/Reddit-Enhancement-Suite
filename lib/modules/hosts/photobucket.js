addLibrary('mediaHosts', 'photobucket', {
	domains: ['photobucket.com'],
	detect: href => (/([is]?)[0-9]+|media|smg|img(?=.photobucket.com)/i).exec(href),
	async handleLink(elem, [, prefix]) {
		const href = elem.href.replace('.html', '');

		// user linked direct image so no need to hit API
		if (prefix === 'i') {
			elem.src = href;
		} else {
			const { imageUrl } = await RESEnvironment.ajax({
				url: 'https://api.photobucket.com/v2/media/fromurl',
				data: { url: href },
				type: 'json'
			});
			elem.src = imageUrl.replace('http:', 'https:');
		}

		elem.type = 'IMAGE';

		if (RESUtils.pageType() === 'linklist') {
			$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
		}

		return elem;
	}
});
