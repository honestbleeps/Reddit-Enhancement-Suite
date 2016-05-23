export default {
	moduleID: 'memecrunch',
	name: 'memecrunch',
	domains: ['memecrunch.com'],
	logo: '//memecrunch.com/static/favicon.ico',
	detect: ({ href }) => (/^https?:\/\/memecrunch\.com\/meme\/([0-9A-Z]+)\/([\w\-]+)(\/image\.(png|jpg))?/i).exec(href),
	handleLink(href, [, id, format]) {
		return {
			type: 'IMAGE',
			src: `https://memecrunch.com/meme/${id}/${format || 'null'}/image.png`,
		};
	},
};
