addLibrary('mediaHosts', 'memedad', {
	domains: ['memedad.com'],
	detect: href => (/^https?:\/\/memedad.com\/meme\/([0-9]+)/i).exec(href),
	handleLink(elem, [, id]) {
		elem.type = 'IMAGE';
		elem.src = `https://memedad.com/memes/${id}.jpg`;
		return elem;
	}
});
