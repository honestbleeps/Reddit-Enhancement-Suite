export default {
	moduleID: 'memecrunch',
	name: 'memecrunch',
	domains: ['memecrunch.com'],
	logo: '//memecrunch.com/static/favicon.ico',
	detect: ({ pathname }) => (/^\/meme\/([0-9A-Z]+)\/([\w\-]+)(\/image\.(png|jpg))?/i).exec(pathname),
	handleLink(href, [, id, format]) {
		return {
			type: 'IMAGE',
			src: `https://memecrunch.com/meme/${id}/${format || 'null'}/image.png`,
		};
	},
};
