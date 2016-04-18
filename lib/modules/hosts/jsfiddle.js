export default {
	moduleID: 'jsfiddle',
	name: 'jsfiddle',
	domains: ['jsfiddle.net'],
	logo: 'https://jsfiddle.net/favicon.png',
	detect: href => (/^https?:\/\/jsfiddle.net(\/(?:\w+\/(?!embedded\/))?[a-z0-9]{5,}(?:\/\d+)?(?=\/|$))(\/embedded\/[\w,]+\/)?/i).exec(href),
	handleLink(elem, [, path, categories]) {
		elem.type = 'IFRAME';
		elem.expandoClass = 'selftext';
		elem.setAttribute('data-embed', `//jsfiddle.net${path}${categories || '/embedded/result,js,resources,html,css/'}`);
		elem.setAttribute('data-width', '100%');
		elem.setAttribute('data-height', '500px');
	}
};
