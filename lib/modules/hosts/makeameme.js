export default {
	moduleID: 'makeameme',
	name: 'makeameme',
	domains: ['makeameme.org'],
	logo: 'http://makeameme.org/images/favicons/favicon-32x32.png',
	detect: href => (/^http:\/\/makeameme\.org\/meme\/([\w\-]+)\/?/i).exec(href),
	handleLink(href, [, id]) {
		return {
			type: 'IMAGE',
			src: `http://makeameme.org/media/created/${id}.jpg`,
		};
	},
};
