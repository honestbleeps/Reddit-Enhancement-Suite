export default {
	moduleID: 'makeameme',
	name: 'makeameme',
	domains: ['makeameme.org'],
	logo: 'http://makeameme.org/images/favicons/favicon-32x32.png',
	detect: ({ pathname }) => (/^\/meme\/([\w\-]+)/i).exec(pathname),
	handleLink(href, [, id]) {
		return {
			type: 'IMAGE',
			src: `http://makeameme.org/media/created/${id}.jpg`,
		};
	},
};
