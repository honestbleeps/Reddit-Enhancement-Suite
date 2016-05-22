export default {
	moduleID: 'twimg',
	name: 'twimg',
	domains: ['twimg.com'],
	logo: 'https://twitter.com/favicon.ico',
	detect: href => (/^https?:\/\/pbs\.twimg\.com\/media\/[\w\-]+\.\w+/i).test(href),
	handleLink(elem) {
		return {
			type: 'IMAGE',
			src: elem.href,
		};
	},
};
