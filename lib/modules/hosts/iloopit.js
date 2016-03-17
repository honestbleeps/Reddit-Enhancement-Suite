addLibrary('mediaHosts', 'iloopit', {
	name: 'iLoopit - gif maker',
	domains: ['iloopit.net'],
	logo: '//iloopit.net/favicon.ico',
	detect: href => (
		(/^https?:\/\/(\w+\.)?iloopit\.net\/.+?\/\?type=looplayer&loopid=(\d+)/i).exec(href) ||
		(/^https?:\/\/(\w+\.)?iloopit\.net(\/tube)?\/(\d+)\/.+?\/(\?type=(looplayer)|(embed))?/i).exec(href)
	),
	handleLink(elem) {
		let link = '';
		const testWithTitle = /iloopit\.net(?:\/tube)?\/(\d+)\/(.+)?\//;
		const titleResult = testWithTitle.exec(elem.href);

		if (titleResult) {
			link = `https://iloopit.net/${titleResult[1]}/${titleResult[2]}/?type=embed`;
		} else {
			link = elem.href.replace('type=looplayer', 'type=embed');
		}

		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', link);
	}
});
