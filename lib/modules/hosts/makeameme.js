addLibrary('mediaHosts', 'makeameme', {
	domains: ['makeameme.org'],
	detect: href => (/^http:\/\/makeameme\.org\/meme\/([\w\-]+)\/?/i).exec(href),
	handleLink(elem, [, id]) {
		elem.type = 'IMAGE';
		elem.src = `http://makeameme.org/media/created/${id}.jpg`;
	}
});
