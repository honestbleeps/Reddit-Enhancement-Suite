export default {
	moduleID: 'memedad',
	name: 'memedad',
	domains: ['memedad.com'],
	logo: '//memedad.com/favicon.ico',
	detect: ({ href }) => (/^https?:\/\/memedad.com\/meme\/([0-9]+)/i).exec(href),
	handleLink(href, [, id]) {
		return {
			type: 'IMAGE',
			src: `https://memedad.com/memes/${id}.jpg`,
		};
	},
};
