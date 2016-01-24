addLibrary('mediaHosts', 'memegen', {
	domains: [
		'memegen.com',
		'memegen.de',
		'memegen.nl',
		'memegen.fr',
		'memegen.it',
		'memegen.es',
		'memegen.se',
		'memegen.pl'
	],
	logo: 'http://www.memegen.com/favicon.ico',
	detect: href => (/^https?:\/\/(?:www|ar|ru|id|el|pt|tr)\.memegen\.(?:com|de|nl|fr|it|es|se|pl)(\/a)?\/(?:meme|mem|mim)\/([A-Za-z0-9]+)/i).exec(href),
	handleLink(elem, [, isAnimated, id]) {
		elem.type = 'IMAGE';
		elem.src = isAnimated ?
			`http://a.memegen.com/${id}.gif` :
			`http://m.memegen.com/${id}.jpg`;
	}
});
