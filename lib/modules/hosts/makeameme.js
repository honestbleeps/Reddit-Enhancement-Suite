export default {
	moduleID: 'makeameme',
	name: 'makeameme',
	domains: ['makeameme.org'],
	logo: 'http://makeameme.org/images/favicons/favicon-32x32.png',
	detect: href => (/^http:\/\/makeameme\.org\/meme\/([\w\-]+)\/?/i).exec(href),
	handleLink(elem, [, id]) {
		elem.type = 'IMAGE';
		elem.src = `http://makeameme.org/media/created/${id}.jpg`;
	}
};
