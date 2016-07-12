export default {
	moduleID: 'memedad',
	name: 'memedad',
	domains: ['memedad.com'],
	logo: '//memedad.com/favicon.ico',
	detect: ({ pathname }) => (/^\/meme\/([0-9]+)/i).exec(pathname),
	handleLink(href, [, id]) {
		return {
			type: 'IMAGE',
			src: `https://memedad.com/memes/${id}.jpg`,
		};
	},
};
