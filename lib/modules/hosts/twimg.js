export default {
	moduleID: 'twimg',
	name: 'twimg',
	domains: ['pbs.twimg.com'],
	logo: 'https://twitter.com/favicon.ico',
	detect: ({ pathname }) => (/^\/media\/[\w\-]+\.\w+/i).test(pathname),
	handleLink(href) {
		return {
			type: 'IMAGE',
			src: href,
		};
	},
};
