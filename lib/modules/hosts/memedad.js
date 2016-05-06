export default {
	moduleID: 'memedad',
	name: 'memedad',
	domains: ['memedad.com'],
	logo: '//memedad.com/favicon.ico',
	detect: href => (/^https?:\/\/memedad.com\/meme\/([0-9]+)/i).exec(href),
	handleLink(elem, [, id]) {
		elem.type = 'IMAGE';
		elem.src = `https://memedad.com/memes/${id}.jpg`;
	},
};
