export default {
	moduleID: 'archive.is',
	name: 'archive.is',
	domains: ['archive.is'],
	logo: 'https://archive.is/favicon.ico',
	detect: ({ pathname }) => (/^\/(\w+)(?:\/|$)/i).exec(pathname),
	handleLink(href, [, code]) {
		return {
			type: 'IMAGE',
			src: `https://archive.fo/${code}/scr.png`,
		};
	},
};
